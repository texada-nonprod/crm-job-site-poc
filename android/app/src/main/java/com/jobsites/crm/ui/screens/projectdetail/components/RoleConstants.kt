package com.jobsites.crm.ui.screens.projectdetail.components

/**
 * Company role constants — matches web app role options.
 */
data class RoleOption(val id: String, val label: String)

val ROLE_OPTIONS = listOf(
    RoleOption("GC", "General Contractor"),
    RoleOption("SUB-EXC", "Sub - Excavation"),
    RoleOption("SUB-PAV", "Sub - Paving"),
    RoleOption("SUB-ELEC", "Sub - Electrical"),
    RoleOption("SUB-MECH", "Sub - Mechanical"),
    RoleOption("SUB-SPEC", "Sub - Specialized"),
    RoleOption("SUB-STEEL", "Sub - Steel"),
)
