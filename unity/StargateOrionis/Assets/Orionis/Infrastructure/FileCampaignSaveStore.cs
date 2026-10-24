using System;
using System.IO;
using System.Text;
using Orionis.Application;

namespace Orionis.Infrastructure
{
    public sealed class FileCampaignSaveStore : ICampaignSaveStore
    {
        private readonly string path;
        private readonly CampaignSaveCodec codec;
        public FileCampaignSaveStore(string path, CampaignSaveCodec codec)
        { this.path = Path.GetFullPath(path); this.codec = codec; }
        public SavedSession Load() { return codec.Deserialize(File.ReadAllText(path)); }
        public void Save(SavedSession session)
        {
            var json = codec.Serialize(session);
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            var temporary = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                using (var stream = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    var bytes = new UTF8Encoding(false).GetBytes(json);
                    stream.Write(bytes, 0, bytes.Length);
                    stream.Flush(true);
                }
                // Replace atomically; never delete the previous save as a fallback.
                if (File.Exists(path)) File.Replace(temporary, path, null);
                else File.Move(temporary, path);
            }
            finally { if (File.Exists(temporary)) File.Delete(temporary); }
        }
    }
}
