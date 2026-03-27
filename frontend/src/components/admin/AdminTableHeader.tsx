import { ArrowUpDown } from "lucide-react"

const AdminTableHeader = ({ name, active, sortOrder, onClick }: { name: string, active: boolean, sortOrder: "asc" | "desc", onClick: () => void }) => {
    return <button type="button" className="inline-flex items-center gap-2" onClick={onClick} title={name}>
        {name}
        <ArrowUpDown className={active ? "h-4 w-4 opacity-100" : "h-4 w-4 opacity-40"} style={{ transform: active && sortOrder === "asc" ? "rotate(180deg)" : undefined }} />
    </button>
}

export default AdminTableHeader;