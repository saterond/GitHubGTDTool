<div class="issue">
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
					<label for="state_1">Change state:</label>
					<select name="state" id="state_{issue_id}">
						<option value="0"{state-active}>active</option>
						<option value="1"{state-completed}>completed</option>
					</select>
				</td>
				<td>
					<label for="assignee_{issue_id}">Change assignee:</label>
					<select name="assignee" id="assignee_{issue_id}">{coworkers}</select>
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
				<td colspan="3" align="right">
					<button class="cupid-green" data-key="{issue_id}" id="editIssue">Edit issue</button>
				</td>
			</tr>
    </table>
  </div>
</div>