using System.Linq;
using Newtonsoft.Json.Linq;
using Orionis.Domain;
namespace Orionis.Infrastructure
{
    internal static class BaseExecutionReader
    {
        public static BaseExecutionCatalog Read(JObject j)=>j==null?null:new BaseExecutionCatalog((string)j["responseRoomDefinitionId"],j["groupToolProviders"].Select(p=>new GroupToolProvider((string)p["roomService"],(string)p["toolService"])));
        public static WorkforceState State(JObject j)=>j==null?null:j.ToObject<WorkforceState>();
    }
}
