import React, { useState, useEffect } from "react";
import { getCurrentSprint } from "../service/issue-service.js";
import { RotateLoader } from "react-spinners";
import classNames from "classnames";
import { wasCompletedOnLastWorkingDay } from "../helper/issue-helper.js";

const issueStati = ["Open", "In Progress", "Done", "Resolved"];
const completedIssueStatiStartIndex = 2;
const taskStati = ["Open", "In Progress", "Code Review", "Done"];

const issueStatiClasses = {
  [issueStati[0]]: "open",
  [issueStati[1]]: "in-progress",
  [issueStati[2]]: "done",
  [issueStati[3]]: "done",
};

const scrollToCompletedOrInProgressItems = () => {
  setTimeout(() => {
    const completeItem = document.querySelector(".latest-complete");
    completeItem && completeItem.scrollIntoView(true);

    if (!completeItem) {
      const inProgressItem = document.querySelector(".in-progress");
      inProgressItem && inProgressItem.scrollIntoView(true);
    }
  });
};

const Board = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const renderSubTasksForStatus = (subtasks, status) => (
    <div key={status} className="sub-task-column">
      {subtasks
        .filter(
          (subtask) =>
            subtask.fields.status.name.toLowerCase() === status.toLowerCase()
        )
        .map((subtask) => (
          <div key={subtask.key} className="sub-task-container">
            {subtask.fields.summary}
          </div>
        ))}
    </div>
  );

  const isIssueDone = (issue) => issue.fields.status.name === "Done";

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
          <div className="last-updated">{issue.fields.updated.substring(0,10)}</div>
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

  const sortCompletedIssuesFirst = (a, b) => {
    const aStatusIndex = issueStati.indexOf(a.fields.status.name);
    const bStatusIndex = issueStati.indexOf(b.fields.status.name);

    if (
      aStatusIndex >= completedIssueStatiStartIndex &&
      bStatusIndex < completedIssueStatiStartIndex
    ) {
      return -1;
    } else if (
      bStatusIndex >= completedIssueStatiStartIndex &&
      aStatusIndex < completedIssueStatiStartIndex
    ) {
      return 1;
    }
    return 0;
  };

  const sortByResolutionDateAscending = (a, b) => {
    const aDateUnParsed = a.fields.resolutiondate;
    const bDateUnParsed = b.fields.resolutiondate;

    if (!aDateUnParsed || !bDateUnParsed) {
      return 0;
    }

    var dateA = new Date(a.fields.resolutiondate),
      dateB = new Date(b.fields.resolutiondate);
    return dateA - dateB;
  };

  const renderIssues = () => {
    return issues
      .filter((issue) => issue.fields.issuetype.name !== "Sub-task")
      .sort(sortCompletedIssuesFirst)
      .sort(sortByResolutionDateAscending)
      .map((issue) => <li key={issue.id}>{renderIssueContent(issue)}</li>);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const activeSprint = await getCurrentSprint();
      setIssues(activeSprint.issues);
      setIsLoading(false);
      scrollToCompletedOrInProgressItems();
    };
    fetchData();
  }, []);

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
