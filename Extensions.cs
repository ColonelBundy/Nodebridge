using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Nodebridge
{
    internal static class Bridgextensions
    {
        public static IServiceCollection AddNodeBridge(this IServiceCollection serviceCollection, Action<InvokeOptions> options = null)
        {
            var config = new InvokeOptions();
            options.Invoke(config);

            if (options == null || config.Logger == null)
            {
                config.Logger = serviceCollection.BuildServiceProvider().GetService<ILogger>();
            }

            serviceCollection.AddSingleton(new Bridge(config));

            return serviceCollection;
        }

        public static Task WithCancellation(this Task task, CancellationToken cancellationToken)
        {
            return task.IsCompleted
                ? task
                : task.ContinueWith(
                    completedTask => completedTask.GetAwaiter().GetResult(),
                    cancellationToken,
                    TaskContinuationOptions.ExecuteSynchronously,
                    TaskScheduler.Default);
        }

        public static Task<T> WithCancellation<T>(this Task<T> task, CancellationToken cancellationToken)
        {
            return task.IsCompleted
                ? task
                : task.ContinueWith(
                    completedTask => completedTask.GetAwaiter().GetResult(),
                    cancellationToken,
                    TaskContinuationOptions.ExecuteSynchronously,
                    TaskScheduler.Default);
        }
    }
}
