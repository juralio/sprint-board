import React from "react";
import { RotateLoader } from "react-spinners";
import classNames from "classnames";
import { wasCompletedOnLastWorkingDay } from "../helper/issue-helper.js";

const issueStati = ["Open", "In Progress", "Done", "Resolved"];
const taskStati = ["Open", "In Progress", "Code Review", "Done"];

const issueStatiClasses = {
  [issueStati[0]]: "open",
  [issueStati[1]]: "in-progress",
  [issueStati[2]]: "done",
  [issueStati[3]]: "done",
};

const Board = (props) => {
  const {
    isIssueDone,
    renderSubTasksForStatus,
    issues,
    sortCompletedIssuesFirst,
    sortByResolutionDateAscending,
    isLoading,
  } = props;

  const renderIssueContent = (issue) => {
    const isNewlyCompleted = wasCompletedOnLastWorkingDay(issue);
    return (
      <div>
        <div
          className={classNames(
            "issue",
            issueStatiClasses[issue.fields.status.name],
            {
              "latest-complete": isNewlyCompleted,
            }
          )}
        >
          {issue.fields.assignee && (
            <img
              alt={`Avatar of ${issue.fields.assignee.name}`}
              src={issue.fields.assignee.avatarUrls["16x16"]}
            ></img>
          )}
          <span className="story-points">{issue.fields.customfield_10008}</span>
          <h4>
            {issue.key} - {issue.fields.summary} - {issue.fields.status.name}
          </h4>
          {isNewlyCompleted && (
            <span
              className="latest-complete-indicator"
              role="img"
              aria-label="Rocket emoji"
            >
              🎈
            </span>
          )}
          <div className="last-updated">
            {issue.fields.updated.substring(0, 10)}
          </div>
        </div>
        {!isIssueDone(issue) && (
          <div
            className="sub-task-grid"
            style={{
              gridTemplateColumns: `repeat(${taskStati.length}, minmax(0, 1fr))`,
            }}
          >
            {taskStati.map((status) =>
              renderSubTasksForStatus(issue.fields.subtasks, status)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderIssues = () => {
    return issues
      .filter((issue) => issue.fields.issuetype.name !== "Sub-task")
      .sort(sortCompletedIssuesFirst)
      .sort(sortByResolutionDateAscending)
      .map((issue) => <li key={issue.id}>{renderIssueContent(issue)}</li>);
  };

  return (
    <div>
      {isLoading && (
        <div className="loading-indicator-container">
          <RotateLoader color="#63a5a9" />
        </div>
      )}
      <ul className="issue-list">{renderIssues()}</ul>
    </div>
  );
};

export default Board;
