import { ActionPanel, List, Action, Icon } from "@raycast/api";
import { useState } from "react";
import {
  CONST,
  execFileAsync,
  formatDueDate,
  formatRenderedDate,
  getFullMonthFromKey,
  getTaskMonthlyKey,
  isPastDueDate,
} from "./lib/utils";
import { useSQL } from "@raycast/utils";
import { GlobalActions } from "./lib/global-actions";
import { initializeDatabase } from "./lib/init-db";
import { monthlyTasksQuery, updateTaskCompletionQuery, type TasksQueryType } from "./lib/queries";

initializeDatabase();

export default function Command() {
  const [key, setKey] = useState(getTaskMonthlyKey(new Date()));

  const { isLoading, data, revalidate } = useSQL<TasksQueryType>(CONST.DB_PATH, monthlyTasksQuery(key));

  function onKeyChange(newKey: string) {
    setKey(newKey);
  }

  async function handleToggle(index: number) {
    if (!data) return;
    if (!data[index]) return;

    const status = data[index].completedAt ? null : new Date().toISOString();

    await execFileAsync("sqlite3", [
      CONST.DB_PATH,
      updateTaskCompletionQuery({
        taskId: data[index].id,
        completedAt: status,
        monthIndex: key,
      }),
    ]);

    await revalidate();
  }

  return (
    <List
      isShowingDetail
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <GlobalActions storageKey={key} onKeyChange={onKeyChange} revalidate={async () => await revalidate()} />
        </ActionPanel>
      }
    >
      <List.Section title={getFullMonthFromKey(key)}>
        {data?.map((task, index) => (
          <List.Item
            key={task.title}
            icon={task.completedAt ? Icon.Checkmark : Icon.Circle}
            title={task.title}
            subtitle={!task.completedAt && isPastDueDate(formatDueDate(task.monthlyDueDate, key)) ? "❗" : ""}
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Title" text={task.title} />
                    <List.Item.Detail.Metadata.Label title="Description" text={task.description} />
                    <List.Item.Detail.Metadata.Label
                      title="Due Date"
                      text={formatRenderedDate(formatDueDate(task.monthlyDueDate, key))}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Completed At"
                      text={task.completedAt ? formatRenderedDate(new Date(task.completedAt)) : "-"}
                    />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                {/* Primary action default to: enter */}
                <ToggleTaskAction task={task} onToggle={() => handleToggle(index)} />

                <GlobalActions revalidate={async () => await revalidate()} storageKey={key} onKeyChange={onKeyChange} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

function ToggleTaskAction(props: { task: TasksQueryType; onToggle: () => void }) {
  return (
    <Action
      icon={props.task.completedAt ? Icon.Circle : Icon.Checkmark}
      title={props.task.completedAt ? "Uncomplete Task" : "Complete Task"}
      onAction={props.onToggle}
    />
  );
}
