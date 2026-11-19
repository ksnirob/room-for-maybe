# Room for Maybe

A local Next.js ERP practice companion with Excel storage. Run `npm ci` and `npm run dev` using Node.js 22, then open http://127.0.0.1:3000/today.

No account is required. Run only on loopback and do not expose it through a proxy or tunnel. Anyone with access to the local preview shares its workspace. The workbook defaults to `.data/local.xlsx` and is created on the first save. Set an absolute WORKBOOK_PATH to override it. Use one running server process per workbook, and close the server before copying or restoring the workbook.

The local workspace uses a separate owner key. Records previously associated with a sign-in account are not displayed or migrated.
# room-for-maybe
# room-for-maybe
