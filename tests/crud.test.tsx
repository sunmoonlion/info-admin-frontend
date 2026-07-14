import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App as AntApp, Button, Input } from "antd";

import {
  AuditedActionModal,
  ContractUpload,
  DataTable,
  ResourceDescription,
  SchemaForm,
  crudMutationHeaders,
  createCrudListParams,
  runCrudMutation,
  toCrudQueryParams,
  useCrudNotifications,
} from "~/components/crud";
import { downloadBlob, sameOriginDownloadUrl } from "~/lib/download";

interface FixtureRow {
  id: string;
  name: string;
}

describe("CRUD toolkit", () => {
  it("normalizes server pagination, sorting and filters deterministically", () => {
    const params = createCrudListParams({
      page: 0,
      pageSize: 999,
      sortField: "updatedAt",
      sortOrder: "descend",
      filters: { status: ["ready", "pending"], ignored: [] },
    });
    expect(params).toEqual({
      page: 1,
      pageSize: 200,
      sort: { field: "updatedAt", order: "descend" },
      filters: { status: ["ready", "pending"] },
    });
    expect(toCrudQueryParams(params).toString()).toBe(
      "page=1&page_size=200&sort=updatedAt&order=desc&filter.status=ready&filter.status=pending",
    );
  });

  it("keeps audited mutation correlation and state transitions together", async () => {
    const states: string[] = [];
    let headers: Record<string, string> | undefined;
    await runCrudMutation(
      async (context) => {
        headers = crudMutationHeaders(context);
        return "ok";
      },
      {
        reason: "fixture operation",
        onStateChange: (snapshot) => states.push(snapshot.status),
      },
    );
    expect(states).toEqual(["running", "succeeded"]);
    expect(headers?.["X-Correlation-ID"]).toBeTruthy();
    expect(headers?.["X-Operation-ID"]).toBeTruthy();
    expect(headers?.["X-Audit-Reason"]).toBe("fixture operation");
  });

  it("separates loading/empty/error table states and retries", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <DataTable<FixtureRow>
        rowKey="id"
        columns={[{ title: "名称", dataIndex: "name" }]}
        data={[]}
        emptyText="没有记录"
      />,
    );
    expect(screen.getByText("没有记录")).toBeInTheDocument();

    rerender(
      <DataTable<FixtureRow>
        rowKey="id"
        columns={[{ title: "名称", dataIndex: "name" }]}
        error={new Error("secret backend detail")}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText("数据加载失败")).toBeInTheDocument();
    expect(screen.queryByText("secret backend detail")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /重\s*试/ }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders a safe empty description and enforces audited reason", async () => {
    const onConfirm = vi.fn();
    render(
      <>
        <ResourceDescription items={[]} emptyText="没有详情" />
        <AuditedActionModal
          open
          minReasonLength={5}
          onCancel={vi.fn()}
          onConfirm={onConfirm}
        />
      </>,
    );
    expect(screen.getByText("没有详情")).toBeInTheDocument();
    const reason = screen.getByPlaceholderText("请输入至少 5 个字符");
    fireEvent.change(reason, { target: { value: "ok" } });
    fireEvent.click(screen.getByRole("button", { name: /确\s*认/ }));
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.change(reason, { target: { value: "valid reason" } });
    fireEvent.click(screen.getByRole("button", { name: /确\s*认/ }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("valid reason"));
  });

  it("keeps upload transport behind an injected adapter", async () => {
    const uploadFile = vi.fn(async (file: File) => ({
      assetId: "fixture-1",
      filename: file.name,
      size: file.size,
    }));
    const onUploaded = vi.fn();
    const { container } = render(
      <AntApp>
        <ContractUpload uploadFile={uploadFile} onUploaded={onUploaded} />
      </AntApp>,
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    fireEvent.change(input!, {
      target: { files: [new File(["fixture"], "fixture.txt", { type: "text/plain" })] },
    });
    await waitFor(() => expect(uploadFile).toHaveBeenCalledOnce());
    expect(onUploaded).toHaveBeenCalledWith({
      assetId: "fixture-1",
      filename: "fixture.txt",
      size: 7,
    });
  });

  it("can defer upload until an audited confirmation", async () => {
    const uploadFile = vi.fn(async (file: File) => ({
      assetId: "fixture-deferred",
      filename: file.name,
      size: file.size,
    }));
    const onBeforeUpload = vi.fn(() => false);
    const { container } = render(
      <AntApp>
        <ContractUpload uploadFile={uploadFile} onBeforeUpload={onBeforeUpload} />
      </AntApp>,
    );
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input!, {
      target: { files: [new File(["fixture"], "deferred.txt", { type: "text/plain" })] },
    });
    await waitFor(() => expect(onBeforeUpload).toHaveBeenCalledOnce());
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("submits a declarative schema form through its adapter", async () => {
    const onSubmit = vi.fn();
    render(
      <SchemaForm<{ name: string }>
        fields={[{ name: "name", label: "名称", input: <Input /> }]}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText("名称"), {
      target: { value: "fixture" },
    });
    fireEvent.click(screen.getByRole("button", { name: /保\s*存/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "fixture" }));
  });

  it("only accepts same-origin download URLs", () => {
    expect(sameOriginDownloadUrl("/api/export", "https://admin.example.test")).toBe(
      "https://admin.example.test/api/export",
    );
    expect(() =>
      sameOriginDownloadUrl("https://attacker.example.test/file", "https://admin.example.test"),
    ).toThrow("current origin");

    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    downloadBlob(new Blob(["fixture"]), "fixture.txt");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    click.mockRestore();
  });

  it("integrates neutral success feedback through the Ant Design provider", async () => {
    function NotificationProbe() {
      const notifications = useCrudNotifications();
      return (
        <Button onClick={() => notifications.success("操作成功")}>通知</Button>
      );
    }

    render(
      <AntApp>
        <NotificationProbe />
      </AntApp>,
    );
    fireEvent.click(screen.getByRole("button", { name: /通\s*知/ }));
    await waitFor(() => expect(screen.getByText("操作成功")).toBeInTheDocument());
  });

  it("keeps basic labels and dialog semantics keyboard discoverable", () => {
    render(
      <AuditedActionModal
        open
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("操作原因")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /取\s*消/ })).toBeInTheDocument();
  });
});
