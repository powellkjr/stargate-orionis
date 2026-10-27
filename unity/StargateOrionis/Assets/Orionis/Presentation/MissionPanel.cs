using System;
using System.Collections.Generic;
using System.Linq;
using Orionis.Application;
using Orionis.Domain;
using UnityEngine;
using UnityEngine.UI;

namespace Orionis.Presentation
{
	public sealed class MissionPanel : MonoBehaviour
	{
		private CampaignSession session;

		private readonly List<string> selected = new List<string>();

		private readonly Dictionary<string, Text> choices = new Dictionary<string, Text>();

		private readonly Dictionary<string, Toggle> checkboxes = new Dictionary<string, Toggle>();

		private Text party;

		private Text status;

		private Button deploy;

		public void Bind(CampaignSession value)
		{
			session = value;
			MissionDefinition mission = session.State.Base.Mission;
			PrototypeUi.Label(PrototypeUi.Rect("Mission title", base.transform, new Vector2(0.01f, 0.87f), new Vector2(0.46f, 1f)), mission.Title, 30);
			ExpeditionState expedition = session.State.Expedition;
			if (expedition != null && expedition.Returned)
			{
				Debrief();
				return;
			}
			if (session.State.Expedition != null)
			{
				Arrival();
				return;
			}
			if (session.State.Teams.Count > 0)
			{
				TeamBriefing();
				return;
			}
			PrototypeUi.Label(PrototypeUi.Rect("Mission briefing", base.transform, new Vector2(0.01f, 0.51f), new Vector2(0.41f, 0.87f)), mission.Briefing);
			party = PrototypeUi.ScrollLabel("Deployment team", base.transform, new Vector2(0.01f, 0.15f), new Vector2(0.41f, 0.51f), "", 18);
			status = PrototypeUi.Label(PrototypeUi.Rect("Deployment status", base.transform, new Vector2(0.01f, 0f), new Vector2(0.41f, 0.06f)), "Create a permanent SG team in Base > Ready Room.", 15);
			deploy = PrototypeUi.Button("Deploy mission", base.transform, new Vector2(0.02f, 0.07f), new Vector2(0.39f, 0.14f), "Deploy to " + mission.Title, new Color(0.12f, 0.35f, 0.4f), delegate
			{
				Run(delegate
				{
					session.Deploy(selected);
				});
			});
			PrototypeUi.Label(PrototypeUi.Rect("Deployment roster heading", base.transform, new Vector2(0.43f, 0.89f), new Vector2(0.99f, 0.97f)), "Select up to " + mission.MaxPartySize + " available Units", 22);
			RectTransform rectTransform = PrototypeUi.Rect("Deployment roster", base.transform, new Vector2(0.43f, 0.03f), new Vector2(0.99f, 0.88f));
			rectTransform.gameObject.AddComponent<Image>().color = new Color(0.08f, 0.11f, 0.15f);
			rectTransform.gameObject.AddComponent<Mask>().showMaskGraphic = true;
			RectTransform rectTransform2 = PrototypeUi.Rect("Deployment entries", rectTransform, new Vector2(0f, 1f), Vector2.one);
			rectTransform2.pivot = new Vector2(0.5f, 1f);
			rectTransform2.sizeDelta = new Vector2(0f, session.State.Base.Units.Count * 82);
			ScrollRect scrollRect = rectTransform.gameObject.AddComponent<ScrollRect>();
			scrollRect.viewport = rectTransform;
			scrollRect.content = rectTransform2;
			scrollRect.horizontal = false;
			scrollRect.movementType = ScrollRect.MovementType.Clamped;
			scrollRect.scrollSensitivity = 35f;
			int num = 0;
			foreach (UnitSummary unit in session.State.Base.Units)
			{
				Button button = PrototypeUi.Button("mission-" + unit.Id, rectTransform2, new Vector2(0f, 1f), Vector2.one, "", Color.Lerp(PrototypeUi.ParseColor(unit.Color), Color.black, 0.65f), delegate
				{
					Toggle(unit.Id);
				});
				RectTransform component = button.GetComponent<RectTransform>();
				component.offsetMin = new Vector2(2f, -(num + 1) * 82 + 2);
				component.offsetMax = new Vector2(-2f, -num * 82 - 2);
				num++;
				choices.Add(unit.Id, button.GetComponentInChildren<Text>());
				Text text = choices[unit.Id];
				text.alignment = TextAnchor.MiddleLeft;
				text.rectTransform.offsetMin = new Vector2(50f, 2f);
				RectTransform rectTransform3 = PrototypeUi.Rect("Select " + unit.Id, component, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f));
				rectTransform3.sizeDelta = new Vector2(26f, 26f);
				rectTransform3.anchoredPosition = new Vector2(26f, 0f);
				Image targetGraphic = rectTransform3.gameObject.AddComponent<Image>();
				Toggle toggle = rectTransform3.gameObject.AddComponent<Toggle>();
				toggle.targetGraphic = targetGraphic;
				toggle.transition = Selectable.Transition.None;
				Text text2 = PrototypeUi.Label(rectTransform3, "✓", 22);
				text2.alignment = TextAnchor.MiddleCenter;
				RectTransform rectTransform4 = text2.rectTransform;
				Vector2 offsetMin = (text2.rectTransform.offsetMax = Vector2.zero);
				rectTransform4.offsetMin = offsetMin;
				toggle.graphic = text2;
				toggle.SetIsOnWithoutNotify(value: false);
				toggle.onValueChanged.AddListener(delegate
				{
					Toggle(unit.Id);
				});
				checkboxes.Add(unit.Id, toggle);
				Outline outline = button.gameObject.AddComponent<Outline>();
				outline.effectColor = new Color(1f, 0.84f, 0.3f);
				outline.effectDistance = new Vector2(2f, -2f);
				outline.useGraphicAlpha = false;
				button.interactable = !session.State.Assignments.Any((StaffAssignment a) => a.UnitId == unit.Id);
			}
			Refresh();
		}

		private string Tools(string unitId, IEnumerable<ExpeditionTool> tools)
		{
			List<string> list = tools.Select((ExpeditionTool t) => t.Label + ": " + t.Charges + " charges" + (t.Damaged ? " (damaged)" : "")).ToList();
			if (list.Count != 0)
			{
				return string.Join(" / ", list);
			}
			return "No equipped Tools";
		}

        private string DeploymentMember(string id) => PrototypeUi.DeploymentLabel(session.State, id);

        private void TeamBriefing()
        {
            gameObject.AddComponent<SGTeamDeploymentPanel>().Bind(session);
        }

		private void Toggle(string id)
		{
			if (selected.Contains(id))
			{
				selected.Remove(id);
			}
			else
			{
				if (selected.Count >= session.State.Base.Mission.MaxPartySize)
				{
					status.text = "The team is full. Remove a selected Unit first.";
					Refresh();
					return;
				}
				selected.Add(id);
			}
			status.text = "";
			Refresh();
		}

		private void Refresh()
		{
			MissionDefinition mission = session.State.Base.Mission;
			party.text = "Team " + selected.Count + "/" + mission.MaxPartySize + "\n";
			foreach (string id in selected)
			{
				session.State.Base.Units.Single((UnitSummary u) => u.Id == id);
				Text text = party;
				text.text = text.text + DeploymentMember(id) + "\n\n";
			}
			foreach (UnitSummary unit in session.State.Base.Units)
			{
				StaffAssignment staffAssignment = session.State.Assignments.SingleOrDefault((StaffAssignment a) => a.UnitId == unit.Id);
				choices[unit.Id].text = PrototypeUi.UnitLabel(unit, mission);
				Toggle toggle = checkboxes[unit.Id];
				bool flag = (toggle.interactable = staffAssignment == null && !session.State.Transfers.Any((StaffTransfer t) => t.UnitId == unit.Id) && !Expeditions.IsIncapacitated(session.State, unit.Id));
				toggle.SetIsOnWithoutNotify(selected.Contains(unit.Id));
				toggle.targetGraphic.color = (flag ? new Color(0.85f, 0.9f, 0.95f) : new Color(0.3f, 0.3f, 0.3f));
				toggle.graphic.color = new Color(0.06f, 0.13f, 0.18f);
				choices[unit.Id].color = (flag ? Color.white : Color.gray);
				choices[unit.Id].transform.parent.GetComponent<Button>().interactable = flag;
				choices[unit.Id].transform.parent.GetComponent<Outline>().enabled = selected.Contains(unit.Id);
			}
			DeploymentReadiness deploymentReadiness = DeploymentReadiness.Inspect(session.State, selected);
			deploy.interactable = deploymentReadiness.CanDeploy;
			status.text = deploymentReadiness.Message;
		}

		private void Arrival()
		{
			ExpeditionState expedition = session.State.Expedition;
			MissionDefinition mission = session.State.Base.Mission;
			RectTransform rectTransform = PrototypeUi.Rect("Gate arrival", base.transform, new Vector2(0.02f, 0.65f), new Vector2(0.45f, 0.85f));
			rectTransform.gameObject.AddComponent<Image>().color = new Color(0.09f, 0.19f, 0.25f);
			string text = ((expedition.StageId == mission.GateStageId) ? "GATE ARRIVAL" : "GATE CONNECTION") + "\n" + (expedition.GateOpen ? "Connection open to SGC" : "Connection closed") + "\n";
			if (expedition.GateOpen)
			{
				text = text + "Connection time remaining: " + (12 - (session.State.Clock.ElapsedTicks - expedition.ConnectionOpenedTick)) + " ticks\n";
			}
			if (expedition.GateChoicePending)
			{
				text += "Maintain the connection or release the SGC Gate.";
			}
			PrototypeUi.Label(rectTransform, text);
			PrototypeUi.Rect("Mission objective tracker", base.transform, new Vector2(0.48f, 0.65f), new Vector2(0.98f, 0.84f)).gameObject.AddComponent<MissionObjectivePanel>().Bind(session.State);
			RectTransform missionMap = PrototypeUi.Rect("Mission map", base.transform, new Vector2(0.02f, 0.02f), new Vector2(0.98f, 0.64f));
			missionMap.gameObject.AddComponent<MissionMapView>().Bind(session);
            var roster=PersonnelCards("Offworld roster viewport",new Vector2(.02f,.02f),new Vector2(.98f,.64f),expedition.Party.Select(m=>m.UnitId));
			roster.gameObject.SetActive(value: false);
			Button toggle = PrototypeUi.Button("Toggle team details", base.transform, new Vector2(0.76f, 0.85f), new Vector2(0.98f, 0.94f), "Team & equipment", new Color(0.13f, 0.25f, 0.31f), delegate
			{
				bool flag = !roster.gameObject.activeSelf;
				roster.gameObject.SetActive(flag);
				missionMap.gameObject.SetActive(!flag);
			});
			toggle.onClick.AddListener(delegate
			{
				toggle.GetComponentInChildren<Text>().text = (roster.gameObject.activeSelf ? "Show map" : "Team & equipment");
			});
			status = PrototypeUi.Label(PrototypeUi.Rect("Deployment status", base.transform, new Vector2(0.02f, 0f), new Vector2(0.45f, 0.045f)), "", 13);
			if (expedition.StageId == mission.GateStageId && !expedition.GateChoicePending)
			{
				PrototypeUi.Button("Extract to SGC", base.transform, new Vector2(0.49f, 0.85f), new Vector2(0.74f, 0.94f), "Extract to SGC", new Color(0.12f, 0.35f, 0.3f), delegate
				{
					MissionExtractionPanel.Open(transform,session);
				}).interactable = MissionRescue.ExtractionBlocker(session.State)==null;
			}
			if (expedition.GateChoicePending)
			{
				PrototypeUi.Button("Maintain Gate", base.transform, new Vector2(0.02f, 0.45f), new Vector2(0.45f, 0.54f), "Maintain connection", new Color(0.12f, 0.35f, 0.4f), delegate
				{
					Run(delegate
					{
						session.ChooseGate(keepOpen: true);
					});
				});
				PrototypeUi.Button("Close Gate", base.transform, new Vector2(0.02f, 0.34f), new Vector2(0.45f, 0.43f), "Close connection", new Color(0.15f, 0.23f, 0.3f), delegate
				{
					Run(delegate
					{
						session.ChooseGate(keepOpen: false);
					});
				});
			}
			else
			{
				PrototypeUi.Rect("Stage travel", base.transform, new Vector2(0.02f, 0.13f), new Vector2(0.45f, 0.64f)).gameObject.AddComponent<MissionTravelPanel>().Bind(session);
			}
			Button button = PrototypeUi.Button("Redial Gate", base.transform, new Vector2(0.02f, 0.055f), new Vector2(0.45f, 0.12f), "Redial SGC / " + mission.RedialTicks + " tick", new Color(0.15f, 0.23f, 0.3f), delegate
			{
				Run(session.RedialGate);
			});
			button.gameObject.SetActive(expedition.StageId==mission.GateStageId);
            button.interactable = !expedition.GateChoicePending && !expedition.GateOpen && expedition.StageId == mission.GateStageId;
			Button[] array = new Button[1] { button };
			foreach (Button button2 in array)
			{
				if (!button2.interactable)
				{
					button2.targetGraphic.color = new Color(0.12f, 0.14f, 0.16f);
					button2.GetComponentInChildren<Text>().color = Color.gray;
				}
			}
		}

		private void Run(Action action)
		{
			try
			{
				action();
			}
			catch (Exception ex)
			{
				status.text = ex.Message;
			}
		}

        private RectTransform PersonnelCards(string name,Vector2 min,Vector2 max,IEnumerable<string> ids,bool report=false)
        {
            var viewport=PrototypeUi.Rect(name,transform,min,max);viewport.gameObject.AddComponent<RectMask2D>();
            var content=PrototypeUi.Rect(name+" entries",viewport,new Vector2(0,1),Vector2.one);content.pivot=new Vector2(.5f,1);
            var list=ids.ToArray();content.sizeDelta=new Vector2(0,list.Length*156);
            var scroll=viewport.gameObject.AddComponent<ScrollRect>();scroll.content=content;scroll.viewport=viewport;scroll.horizontal=false;scroll.scrollSensitivity=35;
            for(int i=0;i<list.Length;i++)
            {
                var id=list[i];var unit=session.State.Base.Units.Single(u=>u.Id==id);
                var button=PrototypeUi.Button(name+"-"+id,content,new Vector2(0,1),Vector2.one,PrototypeUi.UnitLabel(unit,session.State.Base.Mission)+"\n"+(report?"At extraction":"Offworld"),Color.Lerp(PrototypeUi.ParseColor(unit.Color),Color.black,.6f),()=>session.Selection.SelectUnit(id));
                var rect=button.GetComponent<RectTransform>();rect.offsetMin=new Vector2(2,-(i+1)*156+3);rect.offsetMax=new Vector2(-2,-i*156-3);
                button.gameObject.AddComponent<PersonnelCardView>().Bind(session,id,report);
            }
            return viewport;
        }

		private void Debrief()
		{
			CampaignState s = session.State;
			ExpeditionState expedition = s.Expedition;
			bool flag = expedition.Travel.Field.Subjects.Any((FieldSubject x) => x.Id == s.Base.Rescue?.SubjectId && x.Evacuation == "EXTRACTED");
			PrototypeUi.Label(PrototypeUi.Rect("Mission debrief", base.transform, new Vector2(0.53f, 0.66f), new Vector2(0.97f, 0.86f)), "RETURNED TO SGC\n" + (flag ? "Operative recovered to SGC. Extract objective completed." : "Team returned without the operative.") + "\nReturned at tick " + expedition.ExtractedTick + ". The Gate is closed. Save/Load retains this result.", 22);
            PersonnelCards("Returned personnel",new Vector2(.02f,.12f),new Vector2(.51f,.86f),expedition.Party.Select(m=>m.UnitId),true);
			if(s.Base.ResourceProcessing!=null&&ResourceCargo.Collected(s))
			{
				var cache=s.Cargo.Single(i=>ResourceCargo.IsResource(s,i));
				PrototypeUi.Button("Recover Supply cache",transform,new Vector2(.53f,.51f),new Vector2(.97f,.63f),cache.FieldStageId==null?"Supply cache recovered / Receiving queue":"Extract marked Supply cache to incoming inventory",new Color(.12f,.35f,.4f),()=>Run(session.RecoverResourceCache)).interactable=cache.FieldStageId!=null&&ResourceCargo.Collected(s);
			}
			if (s.Base.Cargo?.Caches.Any(c=>RecoveredCargo.CacheRevealed(s,c))==true)
			{
				PrototypeUi.Button("Recover mission cargo", base.transform, new Vector2(0.53f, 0.13f), new Vector2(0.97f, 0.24f), RecoveredCargo.CanRecover(s)?"Recover marked cargo":"Marked cargo recovered / Receiving queue", new Color(0.12f, 0.35f, 0.4f), delegate
				{
					Run(session.RecoverMissionCargo);
				}).interactable = RecoveredCargo.CanRecover(s);
			}
            var receiving=s.Base.Rooms.FirstOrDefault(r=>r.Definition.Id=="receiving");
            int queued=s.Cargo.Count(i=>i.FieldStageId==null&&i.EquippedUnitId==null&&(i.CustodyRoomId==null||i.CustodyRoomId==receiving?.Id)&&!ResourceCargo.Consumed(s,i));
            if(receiving!=null&&queued>0)
                PrototypeUi.Button("Open Receiving queue",transform,new Vector2(.53f,.40f),new Vector2(.97f,.48f),"Open Receiving / "+queued+" items",new Color(.12f,.35f,.4f),()=>GetComponentInParent<PrototypeBootstrap>().OpenReceiving());
			PrototypeUi.Label(PrototypeUi.Rect("Debrief actions", base.transform, new Vector2(0.02f, 0f), new Vector2(0.97f, 0.09f)), "Cards show extraction health and Tool charges. Tools refill on return; base cards show their current state.", 17);
			PrototypeUi.Button("Prepare redeployment", base.transform, new Vector2(0.53f, 0.28f), new Vector2(0.97f, 0.39f), "Prepare redeployment / retain personnel condition", new Color(0.12f, 0.35f, 0.4f), delegate
			{
				Run(session.PrepareRedeployment);
			});
		}
	}
}
