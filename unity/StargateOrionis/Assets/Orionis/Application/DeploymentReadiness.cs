using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Domain;

namespace Orionis.Application
{
    // Preview the real deployment transaction without publishing it or advancing time.
    public sealed class DeploymentReadiness
    {
        public bool CanDeploy { get; }
        public string Message { get; }
        private DeploymentReadiness(bool canDeploy, string message)
        { CanDeploy = canDeploy; Message = message; }

        public static DeploymentReadiness Inspect(CampaignState state, IEnumerable<string> members, string teamId = null)
        {
            try
            {
                var preview = Expeditions.Deploy(state, members, teamId);
                var tools = preview.Expedition.Party.SelectMany(m => m.Tools).ToList();
                var unusable = tools.Count(t => t.Damaged || t.Charges == 0);
                var missing = preview.Expedition.Party.Count(m => m.Tools.Count == 0);
                var notes = new List<string> { "Ready to deploy with current equipment." };
                if (unusable > 0) notes.Add(unusable + " Tool(s) damaged or out of charges.");
                if (missing > 0) notes.Add(missing + " member(s) have no equipped Tools.");
                return new DeploymentReadiness(true, string.Join(" ", notes));
            }
            catch (InvalidOperationException error) { return new DeploymentReadiness(false, error.Message); }
            catch (ArgumentException error) { return new DeploymentReadiness(false, error.Message); }
        }
    }
}
