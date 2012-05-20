<div class="issue" id="issues_{issue_id}">
	<div class="issueHeader">
		<span class="handle"></span>
		<span class="title {projectType}">{title}</span>
		<button class="big-blue-arrow up showInfo" type="button" data-key="{issue_id}"></button>
		<span class="labels">{labels}</span>
		<br />
		<div class="description">{description-short}</div>
  	</div>
	<div class="issueInfo hidden" id="info_{issue_id}">
		<div class="description">{description-full}</div>
		<table>
			<tr>
				<td>
					State: <strong>{state}</strong>
				</td>
				<td>
					Assigned to: <strong>{assigned}</strong>				
				</td>
				<td>
					<span class="issueComplete now{milestone-percent}">Milestone {milestone-percent}%</span>
				</td>
			</tr>
			<tr>
				<td colspan="3">
					<ul class="issueCommits">{commits}</ul>
				</td>
			</tr>
			<tr>
				<td align="right" colspan="3">					
					<button class="minimal" data-key="{issue_id}" id="archiveIssue" style="float:left">Archive</button>
					<button class="minimal" data-key="{issue_id}" id="trashIssue" style="float:left;margin-left:10px">Trash</button>
					<button class="minimal" data-key="{issue_id}" id="closeIssue" style="float:left;margin-left:10px">Close</button>
					<button class="cupid-green" data-key="{issue_id}" id="editIssue">Edit issue</button>					
				</td>
			</tr>
    </table>
  </div>
</div>