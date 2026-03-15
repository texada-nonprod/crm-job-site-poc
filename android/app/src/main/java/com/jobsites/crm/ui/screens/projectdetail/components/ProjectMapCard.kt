package com.jobsites.crm.ui.screens.projectdetail.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.NearMe
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import coil3.network.NetworkHeaders
import coil3.network.httpHeaders
import coil3.request.ImageRequest
import coil3.request.crossfade
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.ln
import kotlin.math.pow
import kotlin.math.tan

/**
 * PROTOTYPE NOTE: This uses free OpenStreetMap tiles which do not support custom pin markers.
 * The map shows the correct area but without a red pin on the exact location.
 * For production, switch to a paid static map service that supports marker overlays:
 *   - Mapbox Static Images API (https://docs.mapbox.com/api/maps/static-images/)
 *   - Google Static Maps API (https://developers.google.com/maps/documentation/maps-static/)
 *   - Geoapify Static Maps (https://www.geoapify.com/static-maps-api)
 * These services accept a marker parameter and render a pin on the map image.
 */
private fun osmTileUrl(lat: Double, lng: Double, zoom: Int = 15): String {
    val n = 2.0.pow(zoom)
    val x = floor((lng + 180.0) / 360.0 * n).toInt()
    val latRad = lat * PI / 180.0
    val y = floor((1.0 - ln(tan(latRad) + 1.0 / cos(latRad)) / PI) / 2.0 * n).toInt()
    return "https://tile.openstreetmap.org/$zoom/$x/$y.png"
}

@Composable
fun ProjectMapCard(
    latitude: Double,
    longitude: Double,
    address: String,
    modifier: Modifier = Modifier
) {
    val hasCoordinates = latitude != 0.0 || longitude != 0.0
    val hasAddress = address.isNotBlank()

    // Nothing to show
    if (!hasCoordinates && !hasAddress) return

    val context = LocalContext.current

    // Build the navigation intent
    val navIntent = if (hasCoordinates) {
        Intent(Intent.ACTION_VIEW, Uri.parse("geo:$latitude,$longitude?q=$latitude,$longitude"))
    } else {
        val encoded = Uri.encode(address)
        Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q=$encoded"))
    }

    // OSM tile URL — only available when we have coordinates
    val mapUrl = if (hasCoordinates) osmTileUrl(latitude, longitude) else null

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable {
                context.startActivity(
                    Intent.createChooser(navIntent, "Navigate with")
                )
            },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Box {
            if (mapUrl != null) {
                // OSM static tile image
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(mapUrl)
                        .httpHeaders(
                            NetworkHeaders.Builder()
                                .set("User-Agent", "JobsitesCRM/1.0 (Android; contact@jobsites.com)")
                                .build()
                        )
                        .crossfade(true)
                        .build(),
                    contentDescription = "Project location map",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp))
                )
            } else {
                // Placeholder when no coordinates — address-only case
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Outlined.Map,
                            contentDescription = null,
                            modifier = Modifier.size(28.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.width(8.dp))
                        Text(
                            text = "Tap to navigate",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Navigate overlay chip
            Row(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(8.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.9f),
                        shape = RoundedCornerShape(16.dp)
                    )
                    .padding(horizontal = 10.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Outlined.NearMe,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = "Navigate",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    fontSize = 11.sp
                )
            }
        }
    }
}
