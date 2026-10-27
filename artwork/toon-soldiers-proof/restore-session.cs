// Unity Pipeline eval_file script, after Bootstrap has entered ordinary Play.
var root=System.IO.Path.GetFullPath("../.validation-toon-soldiers");
var flags=System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic;
var boot=UnityEngine.Object.FindFirstObjectByType<Orionis.Presentation.PrototypeBootstrap>();
if(!UnityEditor.EditorApplication.isPlaying||boot==null)throw new System.Exception("Bootstrap is not running.");
var view=Newtonsoft.Json.Linq.JObject.Parse(System.IO.File.ReadAllText(System.IO.Path.Combine(root,"view.json")));
var clock=(Orionis.Application.CampaignClockController)typeof(Orionis.Presentation.PrototypeBootstrap).GetField("clockController",flags).GetValue(boot);
clock.SetPaused(true);
var codec=new Orionis.Infrastructure.CampaignSaveCodec(System.IO.File.ReadAllText(System.IO.Path.Combine(root,"bootstrap.json")));
var originalStore=typeof(Orionis.Application.CampaignSession).GetField("saves",flags).GetValue(boot.Session);
var tempStore=new Orionis.Infrastructure.FileCampaignSaveStore(System.IO.Path.Combine(root,"session.json"),codec);
var savesField=typeof(Orionis.Application.CampaignSession).GetField("saves",flags);
try
{
    savesField.SetValue(boot.Session,tempStore);
    typeof(Orionis.Presentation.PrototypeBootstrap).GetMethod("Load",flags).Invoke(boot,null);
}
finally{savesField.SetValue(boot.Session,originalStore);}
var selection=boot.Session.Selection.Current;
var restored=codec.Serialize(new Orionis.Application.SavedSession(boot.Session.State,selection==null?null:new Orionis.Application.SelectionReference(selection.Kind,selection.Id)));
var expected=codec.Serialize(codec.Deserialize(System.IO.File.ReadAllText(System.IO.Path.Combine(root,"session.json"))));
if(restored!=expected)throw new System.Exception("Restored campaign differs from validated backup round-trip; clock remains paused.");
foreach(var name in new[]{"showDebug","showMission","showCargo","showPlanning","cargoRoomId","readyRoomId","equipmentRoomId"})
{
    var field=typeof(Orionis.Presentation.PrototypeBootstrap).GetField(name,flags);
    field.SetValue(boot,view[name].Type==Newtonsoft.Json.Linq.JTokenType.Null?null:view[name].ToObject(field.FieldType));
}
typeof(Orionis.Presentation.PrototypeBootstrap).GetMethod("BuildView",flags).Invoke(boot,new object[]{"Live session restored after Toon Soldiers preview."});
clock.SetSpeed((int)view["speed"]);
typeof(Orionis.Application.CampaignClockController).GetField("pendingSeconds",flags).SetValue(clock,(double)view["pendingSeconds"]);
typeof(Orionis.Application.CampaignClockController).GetField("wasOffworld",flags).SetValue(clock,(bool)view["wasOffworld"]);
var realPath=(string)view["realSavePath"];
string realHash=null;
using(var sha=System.Security.Cryptography.SHA256.Create())
    if(System.IO.File.Exists(realPath))realHash=System.Convert.ToBase64String(sha.ComputeHash(System.IO.File.ReadAllBytes(realPath)));
if(realHash!=(string)view["realSaveHash"])throw new System.Exception("Normal save hash changed; clock remains paused.");
var result=new {campaignMatches=true,normalSaveUnchanged=true,viewRestored=true,clockRestored=true,tick=boot.Session.State.Clock.ElapsedTicks};
System.IO.File.WriteAllText("../../artwork/toon-soldiers-proof/session-restoration.json",Newtonsoft.Json.JsonConvert.SerializeObject(result,Newtonsoft.Json.Formatting.Indented));
clock.SetPaused((bool)view["paused"]);
return result;
