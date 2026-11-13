const ADMIN_ROLES = [
    "Admin",
    "Admission Officer",
    "Admission Committee",
    "Academic Office",
    "System Manager",
];

export const getPortalPath = (roles: string[]) => {
    if (roles.some((role) => ADMIN_ROLES.includes(role))) {
        return "/admin";
    }

    if (roles.includes("Student")) {
        return "/student";
    }

    return "/unauthorized";
};

export { ADMIN_ROLES };