using System;

namespace Nodebridge 
{
    public class InvokeException : Exception
    {
        public InvokeException() : base()
        {
        }

        public InvokeException(string message) : base(message)
        {
        }

        public InvokeException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
