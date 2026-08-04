// Real entity fixtures captured from a live HA instance (2026.7.4) via MCP.
// Attributes are verbatim; only friendly_name is varied in hostile-input tests.
// No cover entity exists on the source instance, so aiks-cover-card is untested.
module.exports = {
  "media_player.basement_tv_room": {
    entity_id: "media_player.basement_tv_room", state: "idle",
    attributes: {
      source_list: ["TV", "90s Alternative / Grunge Radio", "Best of 90s Alternative Rock Grunge",
        "Christian Contemporary Holiday Radio", "Killing In The Name - Remastered",
        "NPR News/Talk 90.7", "Chill Mix 1 (JL)"],
      group_members: ["media_player.basement_tv_room"],
      volume_level: 0.3, is_volume_muted: false, media_content_type: "music",
      shuffle: false, repeat: "off", device_class: "speaker",
      friendly_name: "Basement TV Room", supported_features: 8321599
    }
  },
  "remote.living_room_apple_tv": {
    entity_id: "remote.living_room_apple_tv", state: "on",
    attributes: { friendly_name: "Living Room Apple TV", supported_features: 0 }
  },
  "climate.upstairs_nativezone": {
    entity_id: "climate.upstairs_nativezone", state: "cool",
    attributes: {
      hvac_modes: ["off", "auto", "heat_cool", "heat", "cool"],
      min_temp: 55, max_temp: 99, target_temp_step: 1,
      min_humidity: 35, max_humidity: 65,
      fan_modes: ["Auto", "On", "Circulate"],
      preset_modes: ["None", "Home", "Away", "Sleep"],
      current_temperature: 72, temperature: 72,
      target_temp_high: null, target_temp_low: null,
      current_humidity: 49, humidity: 50, fan_mode: "Auto",
      hvac_action: "idle", preset_mode: "None", dehumidify_setpoint: 50,
      attribution: "Data provided by Trane Technologies",
      friendly_name: "Upstairs NativeZone", supported_features: 415
    }
  },
  "light.basement_sitting_area_main_lights": {
    entity_id: "light.basement_sitting_area_main_lights", state: "off",
    attributes: {
      supported_color_modes: ["brightness"], color_mode: null, brightness: null,
      device_id: "40", zone_id: "25",
      friendly_name: "Basement Sitting Area Main Lights", supported_features: 32
    }
  },
  "fan.great_room_fan": {
    entity_id: "fan.great_room_fan", state: "off",
    attributes: {
      preset_modes: ["auto"], direction: "forward", percentage: 0,
      percentage_step: 14.285714285714286, preset_mode: null,
      friendly_name: "Great Room Fan", supported_features: 61
    }
  },
  "switch.back_beds_walk_manual_watering": {
    entity_id: "switch.back_beds_walk_manual_watering", state: "off",
    attributes: {
      attribution: "Data provided by hydrawise.com", device_class: "switch",
      // Literal ampersand: also exercises correct text escaping on render.
      friendly_name: "Back Beds & Walk Manual watering"
    }
  },
  "scene.firepit": {
    entity_id: "scene.firepit", state: "unknown",
    attributes: { friendly_name: "Smart Bridge 2 Firepit" }
  },
  "weather.zuhause": {
    entity_id: "weather.zuhause", state: "partlycloudy",
    attributes: {
      temperature: 70, dew_point: 66, temperature_unit: "°F", humidity: 91,
      uv_index: 0, pressure: 29.6, pressure_unit: "inHg", wind_bearing: 0,
      wind_gust_speed: 0, wind_speed: 0, wind_speed_unit: "mph",
      visibility_unit: "mi", precipitation_unit: "in",
      attribution: "Weather data delivered by WeatherFlow/Tempest API",
      friendly_name: "Zuhause", supported_features: 3
    }
  },
  "select.home_rack_racknas_fan_speed_mode": {
    entity_id: "select.home_rack_racknas_fan_speed_mode", state: "full_speed",
    attributes: {
      options: ["quiet", "cool", "full_speed"],
      attribution: "Data provided by Synology",
      friendly_name: "RackNAS Fan speed mode"
    }
  }
};
