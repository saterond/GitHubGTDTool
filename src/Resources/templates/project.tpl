<div class="project">
    <div class="projectInfoHeader">
        <span class="title {projectType}">{title}{area}</span>
        <button class="big-blue-arrow up showInfo" type="button" data-key="{project_id}"></button>
        <span class="labels">{labels}</span>
        <br />
        <div class="description">{description}</div>
    </div>
    <div class="projectInfo hidden" id="info_{project_id}">        
        <table>
            <thead>
                <tr>
                    <th>Celkem úkolů</th>
                    <th>Z toho hotovo</th>
                    <th>Nejbližší deadline</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{issue_count}</td>
                    <td>{issue_completed}</td>
                    <td>{issue_due}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>