interface AdminNoTableRecordsProps {
    colSpan?: number;
    message?: string;
    show: boolean;
}

const AdminNoTableRecords: React.FC<AdminNoTableRecordsProps> = ({ show = true, colSpan = 10, message = "No Records Available." }) => {
    if (!show) return null;
    return <tr>
        <td colSpan={colSpan} className="px-3 py-6 text-center text-red-500 dark:text-red-400">
            {message}
        </td>
    </tr>
}

export default AdminNoTableRecords