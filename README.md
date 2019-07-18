<h1 align="center">⛓️ Nodebridge ⛓️</h1>

> Bridge between .net core and node.js for pre/server side rendering or node specific tasks.

## ❔ Why use this instead of nodeservices from Microsoft?
> Nodeservices from microsoft spawn a new process almost every new request. And sometimes in situations where you need to persist the process for configuration purposes or just for plain performance, you can't with nodeservices.
> Nodeservices also supports streams where I choose to skip that, if that is needed check the implementation [here](https://github.com/aspnet/JavaScriptServices/blob/bc8984693d4ffe215cc741c97772911c60a2f512/src/Microsoft.AspNetCore.NodeServices/HostingModels/HttpNodeInstance.cs#L96) and create a pr.

## 📄 Prerequisites
* node >= 10.x
* .net core 2.2

## 🚀 Usage

### In Startup -> ConfigureServices 
```C#
  services.AddNodeBridge(options => {
    options.Workingdirectory = ""; // Optional: base directory for your node files. Default: Working directory of your project.
    options.Instances = 1; // Optional: Number of worker threads to spawn. Default: Number of cores of your system.
    options.Logger = loggerInstance; // Optional: Attach any logger that implements the ILogger interface. Default: standard ILogger.
    options.Port = 3000; // Optional: Port for the node bridge to listen on. Default: Random port. 
  });
```

### Usage in controllers
```C#
    public class ValuesController : Controller
    {
        private readonly Nodebridge _bridge;

        public ValuesController(Nodebridge bridge) 
        {
            _bridge = bridge;
        }

        public async Task<IActionResult> Index()
        {
            // Note!
            // Any exported function should return a promise.
            var result = _bridge.Invoke('file.js', 'test', 'hello'); // Will invoke function test in file.js with hello as the first argument.

            ViewBag.result = result;

            return View();
        }
    }
```

## 📝 License

Copyright © 2019 [Colonelbundy](https://github.com/ColonelBundy).<br />
This project is [MIT](https://github.com/ColonelBundy/Nodebridge/blob/master/LICENSE) licensed.