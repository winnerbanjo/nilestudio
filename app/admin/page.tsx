import { AdminCreditForm } from "@/components/admin-credit-form";
import { getAdminDashboardData, requireAdminSession } from "@/lib/admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage() {
  await requireAdminSession();
  const { summary, users, images } = await getAdminDashboardData();

  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="space-y-3">
          <span className="rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
            Admin
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              Studio control room
            </h1>
            <p className="max-w-2xl text-sm text-gray-500 md:text-base">
              Watch usage, manage credits, and track recent generations without leaving the product.
            </p>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="surface-card p-6">
            <p className="text-sm text-gray-500">Users</p>
            <p className="mt-2 text-3xl font-semibold text-[#0A0A0A]">
              {summary.totalUsers}
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm text-gray-500">Generations</p>
            <p className="mt-2 text-3xl font-semibold text-[#0A0A0A]">
              {summary.totalGenerations}
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm text-gray-500">Credits left</p>
            <p className="mt-2 text-3xl font-semibold text-[#0A0A0A]">
              {summary.totalCreditsRemaining}
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="mt-2 text-3xl font-semibold text-[#0A0A0A]">
              {summary.activeAdmins}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="surface-card overflow-hidden p-0">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">
                User credits
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Top up credits quickly for support or testing.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                      User
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#0A0A0A]">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.creditsRemaining} / {user.creditLimit}
                        <p className="mt-1 text-xs text-gray-400">
                          {user.creditPeriod}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <AdminCreditForm
                          userId={user.id}
                          currentCredits={user.creditsRemaining}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface-card p-0">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">
                Recent generations
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Quick read on what the studio is producing now.
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {images.length === 0 ? (
                <div className="px-6 py-8 text-sm text-gray-500">
                  No generations yet.
                </div>
              ) : (
                images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-start justify-between gap-4 px-6 py-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#0A0A0A]">
                        {image.action} / {image.option}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(image.createdAt)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>{image.provider}</p>
                      <p>{image.changed ? "Changed" : "Fallback"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
