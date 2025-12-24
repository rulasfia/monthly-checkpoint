import { ActionPanel, Detail, List, Action, Icon } from "@raycast/api";
import { Task } from "./lib/types";
import { CreateRecurringTaskAction } from "./lib/create-task";
import { useState } from "react";
import { getTaskMonthlyKey } from "./lib/utils";
import { useLocalStorage } from "@raycast/utils";

export default function Command() {
  const [key, setKey] = useState(getTaskMonthlyKey(new Date()));
  const storage = useLocalStorage<Task[]>(key, []);

  console.log({ key, val: storage.value });
  function handleCreate(task: Task) {
    const newTasks = storage.value ? [...storage.value, task] : [task];
    storage.setValue(newTasks);
  }

  function handleToggle(index: number) {
    const newTasks = storage.value ? [...storage.value] : [];
    newTasks[index].completedAt = newTasks[index].completedAt ? null : new Date();
    storage.setValue(newTasks);
  }

  function goToPreviousMonth() {
    const currentMonth = new Date(key + "-01");
    if (currentMonth.getMonth() === 0) {
      currentMonth.setFullYear(currentMonth.getFullYear() - 1);
      currentMonth.setMonth(11);
    } else {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
    }

    const prevKey = getTaskMonthlyKey(currentMonth);
    setKey(prevKey);
  }

  function goToNextMonth() {
    const currentMonth = new Date(key + "-01");
    if (currentMonth.getMonth() === 11) {
      currentMonth.setFullYear(currentMonth.getFullYear() + 1);
      currentMonth.setMonth(0);
    } else {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const nextKey = getTaskMonthlyKey(currentMonth);
    setKey(nextKey);
  }

  return (
    <List
      isLoading={storage.isLoading}
      actions={
        <ActionPanel>
          <CreateRecurringTaskAction onCreate={handleCreate} />

          <ActionPanel.Section title="Change Month">
            <Action
              icon={Icon.ArrowLeft}
              title="Previous Month"
              shortcut={{ modifiers: [], key: "arrowLeft" }}
              onAction={() => goToPreviousMonth()}
            />
            <Action
              icon={Icon.ArrowRight}
              title="Next Month"
              shortcut={{ modifiers: [], key: "arrowRight" }}
              onAction={() => goToNextMonth()}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      {storage.value?.map((task, index) => (
        <List.Item
          key={task.title}
          icon={task.completedAt ? Icon.Checkmark : Icon.Circle}
          title={task.title}
          subtitle={task.description}
          actions={
            <ActionPanel>
              {/* Primary action default to: enter */}
              <Action.Push icon={Icon.ArrowsExpand} title="Show Details" target={<Detail markdown="# Hey! 👋" />} />
              {/* Secondary action default to: cmd+enter */}
              <ToggleTaskAction task={task} onToggle={() => handleToggle(index)} />

              <ActionPanel.Section title="Managed Recurring Tasks">
                <CreateRecurringTaskAction onCreate={handleCreate} />
              </ActionPanel.Section>
              <ActionPanel.Section title="Change Month">
                <Action
                  icon={Icon.ArrowLeft}
                  title="Previous Month"
                  shortcut={{ modifiers: [], key: "arrowLeft" }}
                  onAction={() => goToPreviousMonth()}
                />
                <Action
                  icon={Icon.ArrowRight}
                  title="Next Month"
                  shortcut={{ modifiers: [], key: "arrowRight" }}
                  onAction={() => goToNextMonth()}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ToggleTaskAction(props: { task: Task; onToggle: () => void }) {
  return (
    <Action
      icon={props.task.completedAt ? Icon.Circle : Icon.Checkmark}
      title={props.task.completedAt ? "Uncomplete Task" : "Complete Task"}
      onAction={props.onToggle}
    />
  );
}
