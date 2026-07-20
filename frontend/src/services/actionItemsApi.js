const API_BASE_URL =
  "http://localhost:5001/api/action-items";

/**
 * Sends a request to the Action Items API.
 *
 * credentials: "include" ensures the browser sends the user's
 * authentication session cookie with every request.
 */
async function request(endpoint = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.error ||
        "Unable to complete the action item request."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/**
 * Converts a React action item into the snake_case structure
 * expected by the Flask API.
 */
export function createActionItemPayload(actionItem) {
  return {
    title: actionItem.title,
    description: actionItem.description ?? null,
    status: actionItem.status ?? "pending",
    priority: actionItem.priority ?? "medium",
    estimated_minutes:
      actionItem.estimatedMinutes ??
      actionItem.estimated_minutes ??
      null,
    due_date:
      actionItem.dueDate ??
      actionItem.due_date ??
      null,
  };
}

/**
 * Converts an action-item response from Flask into the camelCase
 * structure used by the React interface.
 */
export function normalizeActionItem(actionItem) {
  return {
    id: actionItem.id,
    title: actionItem.title,
    description: actionItem.description,
    status: actionItem.status,
    priority: actionItem.priority,
    estimatedMinutes: actionItem.estimated_minutes,
    dueDate: actionItem.due_date,
    completedAt: actionItem.completed_at,
    createdAt: actionItem.created_at,
    updatedAt: actionItem.updated_at,
    userId: actionItem.user_id,
    completed: actionItem.status === "completed",
  };
}

/**
 * Returns all action items belonging to the authenticated user.
 */
export async function getActionItems() {
  const actionItems = await request();

  return Array.isArray(actionItems)
    ? actionItems.map(normalizeActionItem)
    : [];
}

/**
 * Returns one action item by its database ID.
 */
export async function getActionItem(actionItemId) {
  const actionItem = await request(`/${actionItemId}`);

  return normalizeActionItem(actionItem);
}

/**
 * Creates a new action item in PostgreSQL through the Flask API.
 */
export async function createActionItem(actionItem) {
  const createdActionItem = await request("", {
    method: "POST",
    body: JSON.stringify(
      createActionItemPayload(actionItem)
    ),
  });

  return normalizeActionItem(createdActionItem);
}

/**
 * Updates supported fields on an existing action item.
 */
export async function updateActionItem(
  actionItemId,
  updates
) {
  const actionItem = await request(`/${actionItemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...updates,
      estimated_minutes:
        updates.estimatedMinutes ??
        updates.estimated_minutes,
      due_date:
        updates.dueDate ??
        updates.due_date,
    }),
  });

  return normalizeActionItem(actionItem);
}

/**
 * Removes an action item using its PostgreSQL database ID.
 */
export function deleteActionItem(actionItemId) {
  return request(`/${actionItemId}`, {
    method: "DELETE",
  });
}