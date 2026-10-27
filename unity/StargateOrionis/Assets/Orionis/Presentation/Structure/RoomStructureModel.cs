using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
namespace Orionis.Presentation.Structure
{
    public sealed class RoomStructureGroup
    {public string Id;public Vector2Int[] Cells;public int? Tier;public Dictionary<RoomArtEdge,string> Doors=new Dictionary<RoomArtEdge,string>();}
    public sealed class RoomStructureBox
    {public string Role,DoorId;public Vector3 Position,Size,Slide;public Quaternion Rotation;public Color Color;public bool Emissive;}
    public sealed class RoomStructureModel
    {
        public readonly List<RoomStructureBox> Boxes=new List<RoomStructureBox>();
        public readonly Dictionary<string,bool> DoorOpen=new Dictionary<string,bool>();
        public static RoomStructureModel Build(IEnumerable<RoomStructureGroup> groups)
        {
            var result=new RoomStructureModel();var edges=new HashSet<Vector2Int>();var junctions=new HashSet<Vector3>();
            foreach(var group in groups.OrderBy(g=>g.Id,StringComparer.Ordinal)){
                var modules=RoomArtTopology.Build(group.Cells,group.Doors.Keys);var owned=new HashSet<RoomArtEdge>();
                foreach(var edge in RoomArtTopology.Exterior(group.Cells))if(edges.Add(edge.Cell*2+RoomArtTopology.Neighbor(edge.Side)))owned.Add(edge);
                foreach(var m in modules){
                    if(m.Role==RoomArtRole.Floor)continue;
                    if(m.Side.HasValue&&!owned.Contains(new RoomArtEdge(m.Cell,m.Side.Value)))continue;
                    if(m.Role==RoomArtRole.Junction&&!junctions.Add(m.Position))continue;
                    string door=m.Side.HasValue&&group.Doors.TryGetValue(new RoomArtEdge(m.Cell,m.Side.Value),out var id)?id:null;
                    void Box(string role,Vector3 offset,Vector3 size,Color color,bool emissive=false)=>result.Boxes.Add(new RoomStructureBox{Role=role,Position=m.Position+m.Rotation*offset,Rotation=m.Rotation,Size=size,Color=color,DoorId=m.Role==RoomArtRole.DoorLeaf?door:null,Slide=m.DoorSlide,Emissive=emissive});
                    var wall=new Color(.66f,.70f,.73f);
                    if(m.Role==RoomArtRole.StraightDoor){Box("Jamb",new Vector3(-(m.Size.x-.08f)/2,0,0),new Vector3(.08f,2,.2f),wall);Box("Jamb",new Vector3((m.Size.x-.08f)/2,0,0),new Vector3(.08f,2,.2f),wall);Box("Lintel",new Vector3(0,.85f,0),new Vector3(m.Size.x-.16f,.3f,.2f),wall);}
                    else Box(m.Role.ToString(),Vector3.zero,m.Size,m.Role==RoomArtRole.Junction?new Color(.42f,.48f,.54f):m.Role==RoomArtRole.DoorLeaf?new Color(.28f,.35f,.41f):wall);
                    if(!group.Tier.HasValue||!RoomArtTierLights.HasFixture(m,modules))continue;
                    float s=RoomArtTierLights.Scale,top=m.Size.y/2;
                    Box("CT channel",new Vector3(0,top+.006f,0),new Vector3(24*s,.012f,6*s),new Color(.48f,.55f,.60f));
                    foreach(var run in RoomArtTierLights.Runs(group.Tier.Value)){
                        Box("CT housing",new Vector3(run.x,top+.016f,0),new Vector3(run.y+2.4f*s,.012f,5.4f*s),new Color(.16f,.20f,.24f));
                        Box("CT recess",new Vector3(run.x,top+.023f,0),new Vector3(run.y+.8f*s,.006f,4.6f*s),new Color(.035f,.05f,.075f));
                        Box("CT lens",new Vector3(run.x,top+.027f,0),new Vector3(run.y,.006f,3.4f*s),RoomArtTierLights.Color(group.Tier.Value),true);
                        Box("CT core",new Vector3(run.x,top+.031f,0),new Vector3(run.y-s,.003f,1.1f*s),RoomArtTierLights.CoreColor(group.Tier.Value),true);
                    }
                }
            }
            return result;
        }
    }
}
