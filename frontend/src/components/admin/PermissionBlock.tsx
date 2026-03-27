import { useAppSelector } from "@/store/hooks";

const PermissionBlock = ({ permission_id = 0, children }: { permission_id: number | boolean | (number | boolean)[], children: React.ReactNode }) => {

    const admin = useAppSelector(state => state.admin);
    if (Array.isArray(permission_id)) {
        let show = false;
        permission_id.forEach((id) => {
            if (id === true) {
                show = true;
            } else if (id !== false && admin.permissions.includes(id)) {
                show = true;
            }
        })

        return show ? children : null;
    } else {
        return permission_id === true ? children : (permission_id === false ? null : (admin.permissions.includes(permission_id) ? children : null));
    }

}

export default PermissionBlock