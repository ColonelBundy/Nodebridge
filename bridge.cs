using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.IO;

namespace Nodebridge
{
    public sealed class InvokeOptions
    {
        /// <summary>
        /// Working directory for your node scripts
        /// Default: Current working directory
        /// </summary>
        public string Workingdirectory { get; set; } = "";

        /// <summary>
        /// Port for the bridge to listen on, only change this if you know what you are doing.
        /// Default: Random port
        /// </summary>
        public int? Port { get; set; }

        /// <summary>
        /// Number of instances worker instances the bridge should span.
        /// Default: Number of cores of the system
        /// </summary>
        public int? Instances { get; set; }

        /// <summary>
        /// Logger implementation
        /// Default: Built in logger
        /// </summary>
        public ILogger Logger { get; set; } = null;
    }

    internal class StartMessage
    {
        public int Port { get; set; }
        public string Addr { get; set; }
    }

    internal class ErrorResponse
    {
        public string Error { get; set; }
        public string Message { get; set; }
    }

    internal class InvokeParams
    {
        public string Module { get; set; }
        public string Opt { get; set; }
        public object[] Data { get; set; }
    }

    public sealed class Bridge
    {
        private readonly HttpClient _client;
        private bool _started;
        private readonly InvokeOptions _options;
        private Process _nodeProcess;
        private readonly ILogger _logger;
        private readonly CancellationToken _stoppingToken;

        private int _port;
        private string _addr;
        private string HttpAddr { get => $"http://{_addr}:{_port}"; }

        /// <summary>
        /// Create a new bridge
        /// </summary>
        /// <param name="options"></param>
        public Bridge(InvokeOptions options, CancellationToken stoppingToken)
        {
            _client = new HttpClient();
            _options = options;
            _stoppingToken = stoppingToken;
            _logger = options.Logger;

            // Start the bridge.
            Start();
        }

        /// <summary>
        /// Json settings
        /// </summary>
        private static readonly JsonSerializerSettings jsonSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            TypeNameHandling = TypeNameHandling.None
        };

        /// <summary>
        /// Invoke a new function
        /// </summary>
        /// <param name="module">file to use</param>
        /// <param name="opt">function to invoke</param>
        /// <param name="args">arguments for the function</param>
        /// <typeparam name="T">return type, either string or an object</typeparam>
        /// <returns>Task<T></returns>
        public Task<T> Invoke<T>(string module, string opt, params object[] args)
        {
            return DoInvoke<T>(new CancellationToken(), module, opt, args);
        }

        /// <summary>
        /// Invoke a new function
        /// </summary>
        /// <param name="cancellationToken">cancellationToken</param>
        /// <param name="module">file to use</param>
        /// <param name="opt">function to invoke</param>
        /// <param name="args">arguments for the function</param>
        /// <typeparam name="T">return type, either string or an object</typeparam>
        /// <returns>Task<T></returns>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1068:CancellationToken parameters must come last", Justification = "<Pending>")]
        public Task<T> Invoke<T>(CancellationToken cancellationToken, string module, string opt, params object[] args)
        {
            return DoInvoke<T>(cancellationToken, module, opt, args);
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1068:CancellationToken parameters must come last", Justification = "<Pending>")]
        internal async Task<T> DoInvoke<T>(CancellationToken cancellationToken, string module, string opt, params object[] args)
        {
            StringContent post = new StringContent(JsonConvert.SerializeObject(new InvokeParams { Data = args, Module = module, Opt = opt }, jsonSettings), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(HttpAddr, post, cancellationToken);
            string readResponse = await response.Content.ReadAsStringAsync().WithCancellation(cancellationToken);

            // Bridge gave us an error, lets rethrow in the .net process.
            if (!response.IsSuccessStatusCode)
            {
                var error = JsonConvert.DeserializeObject<ErrorResponse>(readResponse, jsonSettings);
                throw new InvokeException(error.Message + Environment.NewLine + error.Error);
            }

            var responseContentType = response.Content.Headers.ContentType;
            switch (responseContentType.MediaType)
            {
                case "text/plain":
                    if (typeof(T) != typeof(string))
                    {
                        throw new ArgumentException($"Unable to convert to: {typeof(T).FullName} got string response from the module.");
                    }

                    var responseString = await response.Content.ReadAsStringAsync().WithCancellation(cancellationToken);
                    return (T)(object)responseString;

                case "application/json":
                    var json = await response.Content.ReadAsStringAsync().WithCancellation(cancellationToken);
                    return JsonConvert.DeserializeObject<T>(json, jsonSettings);

                default:
                    throw new InvalidOperationException("Unexpected content type: " + responseContentType.MediaType);
            }
        }

        /// <summary>
        /// Start the process and start listening to the output.
        /// </summary>
        /// <param name="module">worker implementation</param>
        internal void Start()
        {
            if (!_started)
            {
                var pid = Process.GetCurrentProcess().Id;
                string extra = null;
                string workerpath = new StringAsTempFile(EmbeddedResourceReader.Read(typeof(Bridge), "/node/dist/worker.js"), _stoppingToken).FileName;
                string modulePath = new StringAsTempFile(EmbeddedResourceReader.Read(typeof(Bridge), "/node/dist/index.js"), _stoppingToken).FileName;

                if (_options.Port != null)
                {
                    extra += $"--port {_options.Port}";
                }

                if (_options.Instances != null)
                {
                    extra += $"--instances {_options.Instances}";
                }

                if (string.IsNullOrEmpty(_options.Workingdirectory))
                {
                    _options.Workingdirectory = Directory.GetCurrentDirectory();
                }

                // Start the node process
                // Using experimental-worker flag since it's in beta.
                var proc = new ProcessStartInfo("node")
                {
                    Arguments = $"--experimental-worker {modulePath} --pid {pid} --workerpath {workerpath} --workingdir {_options.Workingdirectory} {extra ?? string.Empty}",
                    UseShellExecute = false,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    WorkingDirectory = Directory.GetCurrentDirectory()
                };

                _nodeProcess = Process.Start(proc);
                ReadOutputStreams();
            }
        }

        /// <summary>
        /// Read output of the node process.
        /// </summary>
        private void ReadOutputStreams()
        {
            var pid = Process.GetCurrentProcess().Id;

            // listen for everything here.
            _nodeProcess.OutputDataReceived += (sender, evt) =>
            {
                if (evt.Data != null)
                {
                    // This only happens once, listen for the specific message that tells us the port an addr it's listening on.
                    if (!_started && evt.Data.IndexOf($"[{pid}]") > -1)
                    {
                        var systemOutput = JsonConvert.DeserializeObject<StartMessage>(evt.Data.Split(new string[] { $"[{pid}] " }, StringSplitOptions.None)[1]);

                        _port = systemOutput.Port;
                        _addr = systemOutput.Addr;
                        _started = true;
                    }
                    else
                    {
                        // Log output of the node process to the logger
                        var decoded = UnencodeNewlines(evt.Data);
                        _logger.LogInformation(decoded);
                    }
                }
            };

            // Listening for errors here
            _nodeProcess.ErrorDataReceived += (sender, evt) =>
            {
                if (evt.Data != null)
                {
                    // Log output of the node process to the logger
                    var decoded = UnencodeNewlines(evt.Data);
                    _logger.LogError(decoded);
                }
            };

            _nodeProcess.BeginOutputReadLine();
            _nodeProcess.BeginErrorReadLine();
        }

        // https://github.com/aspnet/aspnetcore/blob/master/src/Middleware/NodeServices/src/HostingModels/OutOfProcessNodeInstance.cs
        private static string UnencodeNewlines(string str)
        {
            if (str != null)
            {
                str = str.Replace("__ns_newline__", Environment.NewLine);
            }

            return str;
        }
    }
}
