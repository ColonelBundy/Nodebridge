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
    public class InvokeOptions
    {
        public string Workingdirectory { get; set; } = "";
        public int? Port { get; set; }
        public int? Instances { get; set; }
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

    public class Bridge
    {
        private readonly HttpClient _client;
        private bool _started;
        private readonly InvokeOptions _options;
        private Process _nodeProcess;
        private readonly ILogger _logger;

        private int _port;
        private string _addr;
        private string HttpAddr { get => $"http://{_addr}:{_port}"; }

        public Bridge(InvokeOptions options)
        {
            _client = new HttpClient();
            _options = options;
            _logger = options.Logger;

            // Start the bridge.
            Start("./node/dist/index.js");
        }

        private static readonly JsonSerializerSettings jsonSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            TypeNameHandling = TypeNameHandling.None
        };

        public Task<T> Invoke<T>(string module, string opt, params object[] args)
        {
            return DoInvoke<T>(new CancellationToken(), module, opt, args);
        }

        public Task<T> Invoke<T>(CancellationToken cancellationToken, string module, string opt, params object[] args)
        {
            return DoInvoke<T>(cancellationToken, module, opt, args);
        }

        internal async Task<T> DoInvoke<T>(CancellationToken cancellationToken, string module, string opt, params object[] args)
        {
            StringContent post = new StringContent(JsonConvert.SerializeObject(new InvokeParams { Data = args, Module = module, Opt = opt }, jsonSettings), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(HttpAddr, post, cancellationToken);
            string readResponse = await response.Content.ReadAsStringAsync().WithCancellation(cancellationToken);

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

        internal void Start(string module)
        {
            if (!_started)
            {
                var pid = Process.GetCurrentProcess().Id;
                string extra = null;

                if (_options.Port != null)
                {
                    extra += $"--port {_options.Port}";
                }

                if (_options.Instances != null)
                {
                    extra += $"--instances {_options.Instances}";
                }

                var proc = new ProcessStartInfo("node")
                {
                    Arguments = $"--experimental-worker {module} --pid {pid} --workingdir {_options.Workingdirectory ?? Directory.GetCurrentDirectory()} {extra ?? string.Empty}",
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

        private void ReadOutputStreams()
        {
            var pid = Process.GetCurrentProcess().Id;

            _nodeProcess.OutputDataReceived += (sender, evt) =>
            {
                if (evt.Data != null)
                {
                    if (!_started && evt.Data.IndexOf($"[{pid}]") > -1)
                    {
                        var systemOutput = JsonConvert.DeserializeObject<StartMessage>(evt.Data.Split($"[{pid}] ")[1]);

                        _port = systemOutput.Port;
                        _addr = systemOutput.Addr;
                        _started = true;
                    }
                    else
                    {
                        var decoded = UnencodeNewlines(evt.Data);
                        _logger.LogInformation(decoded);
                    }
                }
            };

            _nodeProcess.ErrorDataReceived += (sender, evt) =>
            {
                if (evt.Data != null)
                {
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
