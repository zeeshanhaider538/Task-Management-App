// src/components/TaskKanban.jsx
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, Col, Row } from "antd";
import { useTasks } from "../hooks/useTasks";

export const TaskKanban = () => {
  const { tasks, updateTask } = useTasks();

  const grouped = ["Pending", "In Progress", "Completed"].reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {}
  );

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // dropped outside a droppable
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // if dropped in same column and same index, do nothing
    if (sourceStatus === destStatus && source.index === destination.index)
      return;

    // find the task being dragged
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    // update status if changed
    const newStatus = destStatus;
    await updateTask.mutateAsync({ id: task._id, data: { status: newStatus } });

    // optional: reorder within column (if your backend supports `order` update)
    // you can add a reorder mutation here for the column if needed
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Row gutter={16}>
        {Object.keys(grouped).map((status) => (
          <Col span={8} key={status}>
            <h3>{status}</h3>
            <Droppable droppableId={status} isDropDisabled={false}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: 400,
                    background: "#f0f2f5",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  {grouped[status].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ marginBottom: 8 }}
                        >
                          <b>{task.title}</b>
                          <p>{task.description}</p>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Col>
        ))}
      </Row>
    </DragDropContext>
  );
};
