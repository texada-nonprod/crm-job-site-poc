package com.jobsites.crm.ui.navigation

/**
 * Navigation routes for the app.
 * Matches the 4 screens in scope: List, Detail, Create, Edit.
 */
sealed class Screen(val route: String) {
    data object ProjectList : Screen("project_list")
    data object ProjectDetail : Screen("project_detail/{projectId}") {
        fun createRoute(projectId: Int) = "project_detail/$projectId"
    }
    data object CreateProject : Screen("create_project")
    data object EditProject : Screen("edit_project/{projectId}") {
        fun createRoute(projectId: Int) = "edit_project/$projectId"
    }
    data object AddProspect : Screen("add_prospect/{projectId}") {
        fun createRoute(projectId: Int) = "add_prospect/$projectId"
    }
}
