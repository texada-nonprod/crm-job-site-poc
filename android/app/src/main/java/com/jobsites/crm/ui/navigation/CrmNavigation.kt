package com.jobsites.crm.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.jobsites.crm.ui.screens.createproject.CreateProjectScreen
import com.jobsites.crm.ui.screens.editproject.EditProjectScreen
import com.jobsites.crm.ui.screens.projectdetail.ProjectDetailScreen
import com.jobsites.crm.ui.screens.projectlist.ProjectListScreen

@Composable
fun CrmNavigation(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.ProjectList.route,
        modifier = modifier
    ) {
        composable(Screen.ProjectList.route) {
            ProjectListScreen(
                onProjectClick = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                onCreateClick = {
                    navController.navigate(Screen.CreateProject.route)
                }
            )
        }

        composable(
            route = Screen.ProjectDetail.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getInt("projectId") ?: return@composable
            ProjectDetailScreen(
                projectId = projectId,
                onBack = { navController.popBackStack() },
                onEditClick = { id ->
                    navController.navigate(Screen.EditProject.createRoute(id))
                }
            )
        }

        composable(Screen.CreateProject.route) {
            CreateProjectScreen(
                onBack = { navController.popBackStack() },
                onCreated = { projectId ->
                    navController.popBackStack()
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                }
            )
        }

        composable(
            route = Screen.EditProject.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            val projectId = backStackEntry.arguments?.getInt("projectId") ?: return@composable
            EditProjectScreen(
                projectId = projectId,
                onBack = { navController.popBackStack() },
                onSaved = { navController.popBackStack() }
            )
        }
    }
}
