import { randomUUID } from "node:crypto";
import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { Task } from "./types";

function CreateRecurringTaskForm(props: { onCreate: (todo: Task) => void }) {
  const { pop } = useNavigation();

  function handleSubmit(values: { title: string; description: string; dueDate: Date }) {
    props.onCreate({
      id: randomUUID(),
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      completedAt: null,
    });

    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Recurring Task" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" />
      <Form.TextArea id="description" title="Description" />
      <Form.DatePicker id="dueDate" title="Due Date" />
    </Form>
  );
}

export function CreateRecurringTaskAction(props: { onCreate: (todo: Task) => void }) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Create Recurring Task"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<CreateRecurringTaskForm onCreate={props.onCreate} />}
    />
  );
}
