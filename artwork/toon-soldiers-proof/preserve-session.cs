// Unity Pipeline eval_file script; temporary backup, never the user's save slot.
var root = System.IO.Path.GetFullPath("../.validation-toon-soldiers");
System.IO.Directory.CreateDirectory(root);
var flags = System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic;
var boot = UnityEngine.Object.FindFirstObjectByType<Orionis.Presentation.PrototypeBootstrap>();
if (!UnityEditor.EditorApplication.isPlaying || boot == null) throw new System.Exception("Expected the live Bootstrap session.");
var store = typeof(Orionis.Presentation.PrototypeBootstrap).GetField("saveStore",flags).GetValue(boot);
var codec = (Orionis.Infrastructure.CampaignSaveCodec)store.GetType().GetField("codec",flags).GetValue(store);
var clock = (Orionis.Application.CampaignClockController)typeof(Orionis.Presentation.PrototypeBootstrap).GetField("clockController",flags).GetValue(boot);
var selection = boot.Session.Selection.Current;
var saved = new Orionis.Application.SavedSession(boot.Session.State,selection==null?null:new Orionis.Application.SelectionReference(selection.Kind,selection.Id));
var json = codec.Serialize(saved);
codec.Deserialize(json);
System.IO.File.WriteAllText(System.IO.Path.Combine(root,"session.json"),json);
var snapshot = (UnityEngine.TextAsset)typeof(Orionis.Presentation.PrototypeBootstrap).GetField("snapshot",flags).GetValue(boot);
System.IO.File.WriteAllText(System.IO.Path.Combine(root,"bootstrap.json"),snapshot.text);
var view = new System.Collections.Generic.Dictionary<string,object>();
foreach(var name in new[]{"showDebug","showMission","showCargo","showPlanning","cargoRoomId","readyRoomId","equipmentRoomId"})
    view[name]=typeof(Orionis.Presentation.PrototypeBootstrap).GetField(name,flags).GetValue(boot);
view["paused"]=clock.Paused;
view["speed"]=clock.Speed;
view["pendingSeconds"]=typeof(Orionis.Application.CampaignClockController).GetField("pendingSeconds",flags).GetValue(clock);
view["wasOffworld"]=typeof(Orionis.Application.CampaignClockController).GetField("wasOffworld",flags).GetValue(clock);
var realPath=(string)store.GetType().GetField("path",flags).GetValue(store);
view["realSavePath"]=realPath;
using(var sha=System.Security.Cryptography.SHA256.Create())
    view["realSaveHash"]=System.IO.File.Exists(realPath)?System.Convert.ToBase64String(sha.ComputeHash(System.IO.File.ReadAllBytes(realPath))):null;
System.IO.File.WriteAllText(System.IO.Path.Combine(root,"view.json"),Newtonsoft.Json.JsonConvert.SerializeObject(view,Newtonsoft.Json.Formatting.Indented));
clock.SetPaused(true);
UnityEditor.EditorApplication.isPlaying=false;
return "Validated temporary live-session backup; stopping Play for package import.";
