using System;
using System.Collections;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Orionis.Application;
using Orionis.Infrastructure;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
    // Explicit command-line release smoke: never reads/writes the normal save slot.
    // The same Save/Load controls are exercised across two separate player launches.
    internal static class PlayerSaveVerification
    {
        private static string Argument(string name)
        {
            var args=Environment.GetCommandLineArgs();int i=Array.IndexOf(args,name);
            return i>=0&&i+1<args.Length?args[i+1]:null;
        }
        public static bool Requested=>!UnityEngine.Application.isEditor&&Environment.GetCommandLineArgs().Contains("--verify-session");
        public static string SavePath=>Requested?Path.GetFullPath(Argument("--verify-session")??throw new ArgumentException("--verify-session requires a temporary save path.")):null;
        public static IEnumerator Run(PrototypeBootstrap bootstrap,CampaignClockController clock,string snapshot)
        {
            clock.SetPaused(true);yield return null;
            string phase=Argument("--verify-phase"),path=SavePath;int exit=0;
            try
            {
                if(GameObject.Find("Reset mission")!=null||GameObject.Find("Advance tick")!=null)
                    throw new InvalidOperationException("Debug controls are visible by default in the player.");
                var codec=new CampaignSaveCodec(snapshot);
                if(phase=="save")
                {
                    var state=bootstrap.Session.State;
                    var room=state.Base.Rooms.First(r=>r.Definition.Id=="receiving");
                    var unit=state.Base.Units.First(u=>!state.Assignments.Any(a=>a.UnitId==u.Id));
                    bootstrap.Session.AssignUnit(unit.Id,room.Id);bootstrap.Session.Selection.SelectRoom(room.Id);
                    for(int n=0;n<3;n++)bootstrap.Session.AdvanceOneTick();
                    if(GameObject.Find("Admit test object")!=null)throw new InvalidOperationException("Debug intake is visible in the player.");
                    var current=bootstrap.Session.Selection.Current;
                    string expected=codec.Serialize(new SavedSession(bootstrap.Session.State,new SelectionReference(current.Kind,current.Id)));
                    File.WriteAllText(path+".expected.json",expected);
                    GameObject.Find("Save prototype").GetComponent<Button>().onClick.Invoke();
                    if(!File.Exists(path)||File.ReadAllText(path)!=expected)throw new InvalidOperationException("Player Save did not persist the live campaign.");
                }
                else if(phase=="load")
                {
                    GameObject.Find("Load prototype").GetComponent<Button>().onClick.Invoke();
                    var current=bootstrap.Session.Selection.Current;
                    string actual=codec.Serialize(new SavedSession(bootstrap.Session.State,current==null?null:new SelectionReference(current.Kind,current.Id)));
                    if(actual!=File.ReadAllText(path+".expected.json"))throw new InvalidOperationException("Player resume changed campaign state or selection.");
                }
                else throw new ArgumentException("--verify-phase must be save or load.");
                File.WriteAllText(path+"."+phase+".result.json",JsonConvert.SerializeObject(new{passed=true,phase,tick=bootstrap.Session.State.Clock.ElapsedTicks,debugOff=true}));
            }
            catch(Exception error)
            {
                exit=1;File.WriteAllText(path+"."+phase+".result.json",JsonConvert.SerializeObject(new{passed=false,phase,error=error.Message}));
                Debug.LogError("Player save verification failed: "+error.Message);
            }
            UnityEngine.Application.Quit(exit);
        }
    }
}
