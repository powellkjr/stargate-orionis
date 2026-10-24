using System;
using System.Linq;
using Orionis.Domain;

namespace Orionis.Application
{
    public enum SelectionKind { Room, Unit }

    public sealed class SelectionDetails
    {
        public SelectionKind Kind { get; }
        public string Id { get; }
        public string Title { get; }
        public string Description { get; }
        public SelectionDetails(SelectionKind kind, string id, string title, string description)
        { Kind = kind; Id = id; Title = title; Description = description; }
    }

    public sealed class SelectionService
    {
        private readonly BootstrapData data;
        private string selectedKey;
        public SelectionDetails Current { get; private set; }
        public event Action<SelectionDetails> Changed;
        public SelectionService(BootstrapData data) { this.data = data; }
        public void SelectRoom(string id)
        {
            var room = data.Rooms.FirstOrDefault(r => r.Id == id)
                ?? throw new ArgumentException("Unknown room instance: " + id);
            Set("room:" + id, new SelectionDetails(SelectionKind.Room, id, room.Definition.Name,
                $"{id}\n\nConstruction tier {room.ConstructionTier}\nFootprint {room.Definition.Width} × {room.Definition.Height}\nGrid position {room.Col}, {room.Row}"));
        }
        public void SelectUnit(string id)
        {
            var unit = data.Units.FirstOrDefault(u => u.Id == id)
                ?? throw new ArgumentException("Unknown Unit: " + id);
            Set("unit:" + id, new SelectionDetails(SelectionKind.Unit, id, unit.Name,
                $"{id}\n\n{unit.Profession} {unit.Tier}\n{unit.Branch}\n\nPerception {unit.Perception}\nStamina {unit.Stamina}\nEndurance {unit.Endurance}"));
        }
        private void Set(string key, SelectionDetails details)
        {
            if (selectedKey == key) return;
            selectedKey = key;
            Current = details;
            Changed?.Invoke(details);
        }
    }
}
