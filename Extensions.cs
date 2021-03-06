﻿using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Nodebridge
{
    public static class Bridgextensions
    {
        /// <summary>
        /// Add the bridge to DI
        /// </summary>
        /// <param name="serviceCollection"></param>
        /// <param name="options"></param>
        /// <returns>IServiceCollection</returns>
        public static IServiceCollection AddNodeBridge(this IServiceCollection serviceCollection, Action<InvokeOptions> options = null)
        {
            serviceCollection.AddSingleton(typeof(Bridge), serviceProvider =>
            {
                var config = new InvokeOptions();
                var lifetime = serviceProvider.GetService<IHostApplicationLifetime>();

                if (options != null)
                {
                    options.Invoke(config);
                }

                CancellationToken stoppingToken;

                // Get current logger if none was supplied.
                if (config.Logger == null)
                {
                    var factory = serviceProvider.GetService<ILoggerFactory>();

                    config.Logger = factory.CreateLogger<Bridge>();
                }

                if (lifetime != null)
                {
                    stoppingToken = lifetime.ApplicationStopping;
                }

                return new Bridge(config, stoppingToken);
            });

            return serviceCollection;
        }

        /// <summary>
        /// make ReadAsStringAsync cancellable.
        /// </summary>
        /// <param name="task"></param>
        /// <param name="cancellationToken"></param>
        /// <returns>Task</returns>
        internal static Task WithCancellation(this Task task, CancellationToken cancellationToken)
        {
            return task.IsCompleted
                ? task
                : task.ContinueWith(
                    completedTask => completedTask.GetAwaiter().GetResult(),
                    cancellationToken,
                    TaskContinuationOptions.ExecuteSynchronously,
                    TaskScheduler.Default);
        }

        /// <summary>
        /// make ReadAsStringAsync cancellable.
        /// </summary>
        /// <param name="task"></param>
        /// <param name="cancellationToken"></param>
        /// <typeparam name="T"></typeparam>
        /// <returns>Task<T></returns>
        internal static Task<T> WithCancellation<T>(this Task<T> task, CancellationToken cancellationToken)
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
