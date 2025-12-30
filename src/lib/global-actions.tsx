// actions that can be triggered both on empty and non empty state
import { Action, ActionPanel, Icon } from "@raycast/api";
import { CreateRecurringTaskAction } from "./create-task";
import { type Task } from "./types";
import { CONST, execFileAsync, getTaskMonthlyKey } from "./utils";
import { insertNewTaskQuery } from "./queries";

export function GlobalActions(props: {
  storageKey: string;
  onKeyChange: (newKey: string) => void;
  revalidate: () => Promise<any>;
}) {
  async function handleCreate(task: Task) {
    const dueDate = task.dueDate.getDate();

    await execFileAsync("sqlite3", [
      CONST.DB_PATH,
      insertNewTaskQuery({
        title: task.title,
        description: task.description || "",
        createdAt: new Date().toISOString(),
        monthlyDueDate: dueDate,
      }),
    ]);

    props.revalidate();
  }

  function goToPreviousMonth() {
    const currentMonth = new Date(props.storageKey + "-01");
    if (currentMonth.getMonth() === 0) {
      currentMonth.setFullYear(currentMonth.getFullYear() - 1);
      currentMonth.setMonth(11);
    } else {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
    }

    const prevKey = getTaskMonthlyKey(currentMonth);
    props.onKeyChange(prevKey);
  }

  function goToNextMonth() {
    const currentMonth = new Date(props.storageKey + "-01");
    if (currentMonth.getMonth() === 11) {
      currentMonth.setFullYear(currentMonth.getFullYear() + 1);
      currentMonth.setMonth(0);
    } else {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const nextKey = getTaskMonthlyKey(currentMonth);
    props.onKeyChange(nextKey);
  }

  return (
    <>
      <ActionPanel.Section title="Managed Recurring Tasks">
        <CreateRecurringTaskAction onCreate={handleCreate} />
      </ActionPanel.Section>

      <ActionPanel.Section title="Navigate Month">
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
    </>
  );
}
