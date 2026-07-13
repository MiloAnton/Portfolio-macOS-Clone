import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dock from "./dock";

const getDockItem = (label) => screen.getByText(label).closest(".dock-item");

describe("Dock", () => {
  test("derives magnification classes from React hover state", () => {
    render(<Dock windows={{}} onToggle={jest.fn()} />);

    const projects = getDockItem("Projets");
    const curriculum = getDockItem("Curriculum");
    const safari = getDockItem("Safari");
    const messages = getDockItem("Messages");

    fireEvent.mouseEnter(projects);

    expect(projects).toHaveClass("dock-hovered");
    expect(curriculum).toHaveClass("dock-neighbour-1");
    expect(safari).toHaveClass("dock-neighbour-1");
    expect(messages).toHaveClass("dock-neighbour-2");

    fireEvent.mouseLeave(projects);

    expect(projects).not.toHaveClass("dock-hovered");
    expect(curriculum).not.toHaveClass("dock-neighbour-1");
    expect(safari).not.toHaveClass("dock-neighbour-1");
  });

  test("keeps open state declarative and delegates clicks", () => {
    const onToggle = jest.fn();
    render(
      <Dock
        windows={{ projects: { isOpen: true } }}
        onToggle={onToggle}
      />
    );

    const projects = getDockItem("Projets");
    expect(projects).toHaveClass("open");

    fireEvent.click(projects);
    expect(onToggle).toHaveBeenCalledWith("projects");
  });
});
