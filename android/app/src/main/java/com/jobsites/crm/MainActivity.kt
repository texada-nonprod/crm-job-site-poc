package com.jobsites.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.jobsites.crm.ui.navigation.CrmNavigation
import com.jobsites.crm.ui.theme.ProjectsTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ProjectsTheme {
                val navController = rememberNavController()
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    CrmNavigation(
                        navController = navController,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}
