import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import {
  AppIcon,
  AvatarList,
  CollapseSection,
  MarkdownEditor,
  MediaPlayer,
  MetricChart,
  ProgressIndicator,
  Watermark,
} from "~/components/rich";
import {
  darkenHex,
  formatDuration,
  useCopyToClipboard,
  useLongPress,
} from "~/lib/rich-utils";

describe("rich and utility toolkit", () => {
  it("uses a local icon registry and accessible avatar overflow", () => {
    const onSelect = vi.fn();
    render(
      <>
        <AppIcon name="not-in-registry" label="回退图标" />
        <AvatarList
          items={[{ id: "one", label: "One" }, { id: "two", label: "Two" }]}
          max={1}
          onSelect={onSelect}
        />
      </>,
    );
    expect(screen.getByRole("img", { name: "回退图标" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "One" }));
    expect(onSelect).toHaveBeenCalledWith({ id: "one", label: "One" }, 0);
    expect(screen.getByLabelText("还有 1 个头像")).toBeInTheDocument();
  });

  it("renders chart data as both SVG and an accessible table", () => {
    render(<MetricChart title="吞吐量" data={[{ label: "一", value: 3 }]} />);
    expect(screen.getByRole("img", { name: "吞吐量" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "吞吐量数据" })).toBeInTheDocument();
    expect(screen.getByText("一")).toBeInTheDocument();
  });

  it("keeps editor preview as text and rejects unsafe media URLs", () => {
    const onChange = vi.fn();
    render(
      <>
        <MarkdownEditor value={'hello\u0000<script>alert(1)</script>'} onChange={onChange} />
        <MediaPlayer src="//attacker.example.test/file.mp3" title="不安全媒体" />
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveValue("hello<script>alert(1)</script>");
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "next\u0001value" },
    });
    expect(onChange).toHaveBeenCalledWith("nextvalue");
    expect(screen.getByText("媒体地址不安全或无效")).toBeInTheDocument();
  });

  it("provides progress, collapse and watermark semantics", () => {
    render(
      <Watermark text="fixture">
        <ProgressIndicator label="完成度" value={50} />
        <CollapseSection title="详情"><p>fixture detail</p></CollapseSection>
      </Watermark>,
    );
    expect(screen.getByLabelText("完成度")).toBeInTheDocument();
    expect(screen.getByText("详情")).toBeInTheDocument();
    expect(screen.getByText("fixture detail")).not.toBeVisible();
  });

  it("formats values, darkens colors and copies through the browser adapter", async () => {
    expect(formatDuration(3661)).toBe("01:01:01");
    expect(darkenHex("#6699cc", 0.5)).toBe("#334d66");
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    function CopyProbe() {
      const { copy, copied } = useCopyToClipboard();
      return <button onClick={() => void copy("fixture\u0000copy")}>{copied ? "已复制" : "复制"}</button>;
    }
    render(<CopyProbe />);
    fireEvent.click(screen.getByRole("button", { name: "复制" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("fixturecopy"));
  });

  it("fires long press only after the configured delay", () => {
    vi.useFakeTimers();
    try {
      function LongPressProbe() {
        const [fired, setFired] = useState(false);
        const handlers = useLongPress(() => setFired(true), 200);
        return <button {...handlers}>{fired ? "长按完成" : "长按"}</button>;
      }
      render(<LongPressProbe />);
      const button = screen.getByRole("button", { name: "长按" });
      fireEvent.pointerDown(button, { button: 0 });
      act(() => vi.advanceTimersByTime(199));
      expect(screen.getByRole("button", { name: "长按" })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByRole("button", { name: "长按完成" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
