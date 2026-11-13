// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import Pagination, { PaginatedList } from "@/components/dashboard/Pagination";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const props = {
  page: 0,
  pages: 30,
  onChange: vi.fn(),
  label: "Paginación de cuentas",
  position: "inferior" as const,
};
function numbers() {
  return screen
    .getAllByRole("button", { name: /^Página \d+$/ })
    .map((button) => button.textContent);
}
it.each([
  [0, ["1", "2"]],
  [19, ["19", "20", "21"]],
  [29, ["29", "30"]],
] as const)("muestra la ventana vecina de la página %s", (page, expected) => {
  render(<Pagination {...props} page={page} />);
  expect(numbers()).toEqual(expected);
  expect(
    screen
      .getByRole("button", { name: `Página ${page + 1}` })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Anterior" })
      .disabled,
  ).toBe(page === 0);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Siguiente" })
      .disabled,
  ).toBe(page === 29);
});
it("navega por números y flechas sin volver a solicitar la página actual", () => {
  const change = vi.fn();
  render(<Pagination {...props} page={19} onChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "Página 20" }));
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Página 21" }));
  expect(change).toHaveBeenLastCalledWith(20);
  fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
  expect(change).toHaveBeenLastCalledWith(18);
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  expect(change).toHaveBeenLastCalledWith(20);
});
it.each([0, 1])("no dibuja controles para %s páginas", (pages) => {
  render(<Pagination {...props} pages={pages} />);
  expect(screen.queryByRole("navigation")).toBeNull();
});
it("bloquea todos los controles durante una operación", () => {
  const change = vi.fn();
  render(<Pagination {...props} page={19} onChange={change} disabled />);
  for (const button of screen.getAllByRole<HTMLButtonElement>("button")) {
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
  }
  expect(change).not.toHaveBeenCalled();
});
it("ajusta la página visible cuando el total se reduce", () => {
  render(<Pagination {...props} page={19} pages={3} />);
  expect(numbers()).toEqual(["2", "3"]);
  expect(
    screen
      .getByRole("button", { name: "Página 3" })
      .getAttribute("aria-current"),
  ).toBe("page");
});

function measurements(initialHeight: number) {
  let height = initialHeight;
  let notify = () => undefined as void;
  const disconnect = vi.fn();
  const observe = vi.fn<(element: Element) => void>();
  vi.stubGlobal("innerHeight", 600);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ height }) as DOMRect,
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        notify = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  return {
    resize: (value: number) => {
      height = value;
      notify();
    },
    observe,
    disconnect,
  };
}
function List() {
  const [page, setPage] = useState(0);
  return (
    <PaginatedList
      page={page}
      pages={30}
      onChange={setPage}
      label="Paginación de cuentas"
    >
      <ul>
        <li>Contenido</li>
      </ul>
    </PaginatedList>
  );
}
it("solo duplica arriba cuando las filas superan la pantalla y sincroniza ambos controles", async () => {
  const measurement = measurements(900);
  render(<List />);
  const top = await screen.findByRole("navigation", {
    name: "Paginación de cuentas superior",
  });
  const bottom = screen.getByRole("navigation", {
    name: "Paginación de cuentas inferior",
  });
  expect(measurement.observe.mock.calls[0]?.[0]?.textContent).toBe("Contenido");
  fireEvent.click(within(top).getByRole("button", { name: "Página 2" }));
  for (const nav of [top, bottom])
    expect(
      within(nav)
        .getByRole("button", { name: "Página 2" })
        .getAttribute("aria-current"),
    ).toBe("page");
  fireEvent.click(within(bottom).getByRole("button", { name: "Anterior" }));
  expect(
    within(top)
      .getByRole("button", { name: "Página 1" })
      .getAttribute("aria-current"),
  ).toBe("page");
  act(() => measurement.resize(600));
  expect(
    screen.queryByRole("navigation", {
      name: "Paginación de cuentas superior",
    }),
  ).toBeNull();
});
it("recalcula la altura al cambiar el contenido y el tamaño de la pantalla", async () => {
  const measurement = measurements(400);
  const remove = vi.spyOn(window, "removeEventListener");
  const { unmount } = render(<List />);
  await waitFor(() => expect(measurement.observe).toHaveBeenCalled());
  expect(
    screen.queryByRole("navigation", {
      name: "Paginación de cuentas superior",
    }),
  ).toBeNull();
  act(() => measurement.resize(800));
  expect(
    screen.getByRole("navigation", { name: "Paginación de cuentas superior" }),
  ).toBeTruthy();
  act(() => {
    window.innerHeight = 1000;
    fireEvent(window, new Event("resize"));
  });
  expect(
    screen.queryByRole("navigation", {
      name: "Paginación de cuentas superior",
    }),
  ).toBeNull();
  unmount();
  expect(measurement.disconnect).toHaveBeenCalledOnce();
  expect(remove.mock.calls.some(([event]) => event === "resize")).toBe(true);
});
it("preserva el foco cuando desaparece la navegación superior", async () => {
  const measurement = measurements(900);
  render(<List />);
  const top = await screen.findByRole("navigation", {
    name: "Paginación de cuentas superior",
  });
  within(top).getByRole("button", { name: "Página 1" }).focus();
  act(() => measurement.resize(400));
  expect(document.activeElement).toBe(
    within(
      screen.getByRole("navigation", {
        name: "Paginación de cuentas inferior",
      }),
    ).getByRole("button", { name: "Página 1" }),
  );
});
