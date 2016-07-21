/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "view/main-view.h"
#include "view/window.h"

#include "utils/config.h"
#include "utils/logger.h"
#include "utils/ui-utils.h"

#include <camera.h>
#include <dirent.h>
#include <efl_extension.h>
#include <Elementary.h>
#include <wav_player.h>

#define COUNTER_STR_LEN 3
#define FILE_PREFIX "IMAGE"

static const char *_error = "Error";
static const char *_camera_init_failed = "Camera initialization failed.";
static const char *_app_init_failed = "Image viewing application initialization failed.";
static const char *_app_not_found = "Image viewing application wasn't found.";
static const char *_ok = "OK";
static const char _file_prot_str[] = "file://";

typedef struct {
	Evas_Object *navi;
	Elm_Object_Item *navi_item;
	Evas_Object *layout;
	Evas_Object *popup;
	Evas_Object *preview_canvas;

	camera_h camera;
	Eina_Bool camera_enabled;

	Ecore_Timer *timer;
	int timer_count;
	int selected_timer_interval;
} main_view;

static void _main_view_destroy(void *data, Evas *e, Evas_Object *obj, void *event_info);
static Eina_Bool _main_view_init_camera(main_view *view);
static void _main_view_register_cbs(main_view *view);
static void _main_view_thumbnail_load(main_view *view);
static void _main_view_thumbnail_set(main_view *view, const char *file_path);

static void _main_view_start_timer(main_view *view);
static void _main_view_stop_timer(main_view *view);
static void _main_view_timer_count_update(main_view *view);
static Eina_Bool _main_view_timer_cb(void *data);
static void _main_view_back_cb(void *data, Evas_Object *obj, void *event_info);
static void _main_view_pause_cb(void *data, Evas_Object *obj, void *event_info);
static void _main_view_resume_cb(void *data, Evas_Object *obj, void *event_info);

static size_t _main_view_get_last_file_path(char *file_path, size_t size);
static size_t _main_view_get_file_path(char *file_path, size_t size);

static void _main_view_capture_cb(camera_image_data_s *image, camera_image_data_s *postview, camera_image_data_s *thumbnail, void *user_data);
static void _main_view_capture_completed_cb(void *data);
static Eina_Bool _main_view_start_camera_preview(camera_h camera);
static Eina_Bool _main_view_stop_camera_preview(camera_h camera);

static void _main_view_shutter_button_cb(void *data, Evas_Object *obj, const char *emission, const char *source);
static void _main_view_gallery_button_cb(void *data, Evas_Object *obj, const char *emission, const char *source);
static void _main_view_timer_2_cb(void *data, Evas_Object *obj, const char *emission, const char *source);
static void _main_view_timer_5_cb(void *data, Evas_Object *obj, const char *emission, const char *source);
static void _main_view_timer_10_cb(void *data, Evas_Object *obj, const char *emission, const char *source);

static void _main_view_show_warning_popup(Evas_Object *navi, const char *caption, const char *text, const char *button_text, void *data);
static void _main_view_popup_close_cb(void *data, Evas_Object *obj, void *event_info);

Evas_Object *main_view_add(Evas_Object *navi)
{
	main_view *view = calloc(1, sizeof(main_view));
	RETVM_IF(!view, NULL, "calloc() failed");
	view->navi = navi;

	view->layout = ui_utils_layout_add(view->navi, _main_view_destroy, view);
	if (!view->layout) {
		ERR("ui_utils_layout_add() failed");
		free(view);
		return NULL;
	}

	elm_layout_file_set(view->layout, get_resource_path(SELF_CAMERA_LAYOUT), "layout");
	elm_object_signal_emit(view->layout, "mouse,clicked,1", "timer_2");

	view->preview_canvas = evas_object_image_filled_add(evas_object_evas_get(view->layout));
	if (!view->preview_canvas) {
		ERR("_main_view_rect_create() failed");
		evas_object_del(view->layout);
		return NULL;
	}

	elm_object_part_content_set(view->layout, "elm.swallow.content", view->preview_canvas);

	view->camera_enabled = _main_view_init_camera(view);
	if (!view->camera_enabled) {
		ERR("_main_view_start_preview failed");
		_main_view_show_warning_popup(navi, _error, _camera_init_failed, _ok, view);
	}

	_main_view_thumbnail_load(view);
	_main_view_register_cbs(view);

	view->navi_item = elm_naviframe_item_push(view->navi, NULL, NULL, NULL, view->layout, NULL);
	elm_naviframe_item_title_enabled_set(view->navi_item, EINA_FALSE, EINA_FALSE);

	return view->layout;
}

static void _main_view_destroy(void *data, Evas *e, Evas_Object *obj, void *event_info)
{
	main_view *view = data;
	_main_view_stop_camera_preview(view->camera);
	camera_destroy(view->camera);

	free(data);
}

static Eina_Bool _main_view_start_camera_preview(camera_h camera)
{
	camera_state_e cur_state = CAMERA_STATE_NONE;
	int res = camera_get_state(camera, &cur_state);
	if (CAMERA_ERROR_NONE == res) {
		if (cur_state != CAMERA_STATE_PREVIEW) {
			res = camera_start_preview(camera);
			if (CAMERA_ERROR_NONE == res) {
				camera_start_focusing(camera, TRUE);
				return EINA_TRUE;
			}
		}
	} else {
		ERR("Cannot get camera state. Error: %d", res);
	}

	return EINA_FALSE;
}

static Eina_Bool _main_view_stop_camera_preview(camera_h camera)
{
	camera_state_e cur_state = CAMERA_STATE_NONE;
	int res = camera_get_state(camera, &cur_state);
	if (CAMERA_ERROR_NONE == res) {
		if (cur_state == CAMERA_STATE_PREVIEW) {
			camera_stop_preview(camera);
			return EINA_TRUE;
		}
	} else {
		ERR("Cannot get camera state. Error: %d", res);
	}

	return EINA_FALSE;
}

static void _main_view_rotate_image_preview(camera_h camera, int lens_orientation)
{
	int display_rotation_angle = (360 - lens_orientation) % 360;

	camera_rotation_e rotation = CAMERA_ROTATION_NONE;
	switch (display_rotation_angle) {
	case 0:
		break;
	case 90:
		rotation = CAMERA_ROTATION_90;
		break;
	case 180:
		rotation = CAMERA_ROTATION_180;
		break;
	case 270:
		rotation = CAMERA_ROTATION_270;
		break;
	default:
		ERR("Wrong lens_orientation value");
		return;
	}

	camera_set_display_rotation(camera, rotation);
}

static void _main_view_set_image_rotation_exif(camera_h camera, int lens_orientation)
{
	if (camera_attr_enable_tag(camera, true) == CAMERA_ERROR_NONE) {
		camera_attr_tag_orientation_e orientation = CAMERA_ATTR_TAG_ORIENTATION_TOP_RIGHT;
		switch (lens_orientation) {
		case 0:
			break;
		case 90:
			orientation = CAMERA_ATTR_TAG_ORIENTATION_RIGHT_BOTTOM;
			break;
		case 180:
			orientation = CAMERA_ATTR_TAG_ORIENTATION_BOTTOM_LEFT;
			break;
		case 270:
			orientation = CAMERA_ATTR_TAG_ORIENTATION_LEFT_TOP;
			break;
		default:
			ERR("Wrong lens_orientation value");
			return;
		}

		camera_attr_set_tag_orientation(camera, orientation);
	} else {
		ERR("Cannot enable write of EXIF information");
	}
}
static Eina_Bool _main_view_init_camera(main_view *view)
{
	int result = camera_create(CAMERA_DEVICE_CAMERA1, &view->camera);
	if (CAMERA_ERROR_NONE == result) {
		if (view->preview_canvas) {
			result = camera_set_display(view->camera, CAMERA_DISPLAY_TYPE_EVAS, GET_DISPLAY(view->preview_canvas));
			if (CAMERA_ERROR_NONE == result) {
				camera_set_display_mode(view->camera, CAMERA_DISPLAY_MODE_ORIGIN_SIZE);
				camera_set_display_visible(view->camera, true);

				int lens_orientation = 0;
				if (camera_attr_get_lens_orientation(view->camera, &lens_orientation) == CAMERA_ERROR_NONE) {
					/* Rotate video preview to compensate different lens orientations */
					_main_view_rotate_image_preview(view->camera, lens_orientation);

					/* Rotate captured image to compensate different lens orientations */
					_main_view_set_image_rotation_exif(view->camera, lens_orientation);
				} else {
					ERR("Cannot get camera lens attribute");
				}

				return _main_view_start_camera_preview(view->camera);
			}
		}
	}
	return !result;
}

static void _main_view_register_cbs(main_view *view)
{
	evas_object_smart_callback_add(view->layout, EVENT_BACK, _main_view_back_cb, view);
	evas_object_smart_callback_add(view->layout, EVENT_PAUSE, _main_view_pause_cb, view);
	evas_object_smart_callback_add(view->layout, EVENT_RESUME, _main_view_resume_cb, view);
	elm_object_signal_callback_add(view->layout, "timer_2_selected", "*", _main_view_timer_2_cb, view);
	elm_object_signal_callback_add(view->layout, "timer_5_selected", "*", _main_view_timer_5_cb, view);
	elm_object_signal_callback_add(view->layout, "timer_10_selected", "*", _main_view_timer_10_cb, view);
	elm_object_signal_callback_add(view->layout, "shutter_button_clicked", "*", _main_view_shutter_button_cb, view);
	elm_object_signal_callback_add(view->layout, "gallery_button_clicked", "*", _main_view_gallery_button_cb, view);
}

static void _main_view_thumbnail_load(main_view *view)
{
	char file_path[PATH_MAX] = { '\0' };
	if (_main_view_get_last_file_path(file_path, sizeof(file_path))) {
		_main_view_thumbnail_set(view, file_path);
	} else {
		elm_object_signal_emit(view->layout, "no_image", "gallery_button");
	}
}

static void _main_view_thumbnail_set(main_view *view, const char *file_path)
{
	Evas_Object *img = elm_image_add(view->layout);
	elm_image_file_set(img, file_path, NULL);
	elm_object_part_content_set(view->layout, "thumbnail", img);
	elm_object_signal_emit(view->layout, "default", "gallery_button");
}

static void _main_view_start_timer(main_view *view)
{
	view->timer_count = view->selected_timer_interval;
	_main_view_timer_count_update(view);

	if (view->timer == NULL) {
		view->timer = ecore_timer_add(1.0, _main_view_timer_cb, view);
		eext_object_event_callback_add(view->layout, EEXT_CALLBACK_BACK, _main_view_back_cb, view);
	}
}

static void _main_view_stop_timer(main_view *view)
{
	ecore_timer_del(view->timer);
	view->timer = NULL;
	view->timer_count = 0;
	_main_view_timer_count_update(view);
	eext_object_event_callback_del(view->layout, EEXT_CALLBACK_BACK, _main_view_back_cb);
}

static void _main_view_timer_count_update(main_view *view)
{
	DBG("timer_count_update");
	DBG("timer count ... [ %d ]", view->timer_count);

	char count_string[COUNTER_STR_LEN] = { '\0' };
	if (view->timer_count > 0) {
		snprintf(count_string, sizeof(count_string), "%d", view->timer_count);
	}

	elm_object_part_text_set(view->layout, "timer_text", count_string);
	evas_object_show(view->layout);
}

static Eina_Bool _main_view_timer_cb(void *data)
{
	RETVM_IF(!data, ECORE_CALLBACK_CANCEL, "data is NULL");
	main_view *view = data;

	view->timer_count = view->timer_count - 1;
	if (view->timer_count > 0) {
		DBG("timer continue ... ");
		int handle = 0;
		wav_player_start(get_resource_path(SOUND_COUNT), SOUND_TYPE_MEDIA, NULL, view, &handle);
		_main_view_timer_count_update(view);
		return ECORE_CALLBACK_RENEW;
	} else {
		DBG("timer terminated ...");
		_main_view_stop_timer(view);
		if (view->camera_enabled) {
			camera_start_capture(view->camera, _main_view_capture_cb, _main_view_capture_completed_cb, view);
		} else {
			ERR("Camera hasn't been initialized.");
		}
		return ECORE_CALLBACK_CANCEL;
	}
}

static void _main_view_back_cb(void *data, Evas_Object *obj, void *event_info)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;

	if (view->timer) {
		_main_view_stop_timer(data);
	}
}

static void _main_view_pause_cb(void *data, Evas_Object *obj, void *event_info)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;

	_main_view_stop_camera_preview(view->camera);
}

static void _main_view_resume_cb(void *data, Evas_Object *obj, void *event_info)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;

	_main_view_start_camera_preview(view->camera);
}

static int _main_view_image_file_filter(const struct dirent *dir)
{
	return (strncmp(dir->d_name, FILE_PREFIX, sizeof(FILE_PREFIX) - 1) == 0);
}

static size_t _main_view_get_last_file_path(char *file_path, size_t size)
{
	int n = -1;
	struct dirent **namelist = NULL;
	int ret_size = 0;

	n = scandir(CAMERA_DIRECTORY, &namelist, _main_view_image_file_filter, alphasort);
	if (n > 0) {
		ret_size = snprintf(file_path, size, "%s/%s", CAMERA_DIRECTORY, namelist[n - 1]->d_name);

		/* Need to go through array to clear it */
		int i;
		for (i = 0; i < n; ++i) {
			/* The last file in sorted array will be taken */
			free(namelist[i]);
		}
	} else {
		ERR("No files or failed to make scandir");
	}

	free(namelist);
	return ret_size;
}

static size_t _main_view_get_file_path(char *file_path, size_t size)
{
	RETVM_IF(!file_path, 0, "file_path is NULL");

	struct tm localtime = { 0 };
	time_t rawtime = time(NULL);
	if (localtime_r(&rawtime, &localtime) == NULL) {
		return 0;
	}

	return snprintf(file_path, size, "%s/%s_%04i-%02i-%02i_%02i:%02i:%02i.jpg",
	CAMERA_DIRECTORY, FILE_PREFIX, localtime.tm_year + 1900, localtime.tm_mon + 1, localtime.tm_mday, localtime.tm_hour, localtime.tm_min, localtime.tm_sec);
}

static void _main_view_capture_cb(camera_image_data_s *image, camera_image_data_s *postview, camera_image_data_s *thumbnail, void *user_data)
{
	RETM_IF(!user_data, "user_data is NULL");
	main_view *view = user_data;
	if (!view->camera_enabled) {
		ERR("Camera hasn't been initialized.");
		return;
	}

	_main_view_stop_camera_preview(view->camera);

	if (image->format == CAMERA_PIXEL_FORMAT_JPEG) {
		DBG("got JPEG data - data [%p], length [%d], width [%d], height [%d]",
				image->data, image->size, image->width, image->height);

		char filename[PATH_MAX] = { '\0' };
		size_t size = _main_view_get_file_path(filename, sizeof(filename));
		DBG("%s", filename);
		RETM_IF(0 == size, "_main_view_get_filename() failed");

		FILE *file = fopen(filename, "w+");
		RETM_IF(!file, "fopen() failed");

		size = fwrite(image->data, image->size, 1, file);
		WARN_IF(size != 1, "fwrite() failed");

		fclose(file);
		_main_view_thumbnail_set(view, filename);
	}
}

static void _main_view_capture_completed_cb(void *data)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;
	if (!view->camera_enabled) {
		ERR("Camera hasn't been initialized.");
		return;
	}

	_main_view_start_camera_preview(view->camera);
}

static void _main_view_shutter_button_cb(void *data, Evas_Object *obj, const char *emission, const char *source)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;
	_main_view_start_timer(view);
}

static void _main_view_gallery_button_cb(void *data, Evas_Object *obj, const char *emission, const char *source)
{
	RETM_IF(!data, "data is NULL");

	app_control_h app_control = NULL;

	char file_path[PATH_MAX] = { '\0' };
	if (0 == _main_view_get_last_file_path(file_path, sizeof(file_path))) {
		return;
	}

	int ret = app_control_create(&app_control);
	if (ret != APP_CONTROL_ERROR_NONE) {
		ERR("app_control_create() failed.");
		return;
	}

	char file_path_prepared[PATH_MAX + sizeof(_file_prot_str)] = { '\0' };
	strcpy(file_path_prepared, _file_prot_str);
	strcat(file_path_prepared, file_path);
	ret = app_control_set_uri(app_control, file_path_prepared);
	if (ret != APP_CONTROL_ERROR_NONE) {
		ERR("app_control_set_uri() failed.");
		app_control_destroy(app_control);
		return;
	}

	ret = app_control_set_operation(app_control, APP_CONTROL_OPERATION_VIEW);
	if (ret != APP_CONTROL_ERROR_NONE) {
		ERR("app_control_set_operation() failed.");
		app_control_destroy(app_control);
		return;
	}

	ret = app_control_set_mime(app_control, IMAGE_MIME_TYPE);
	if (ret != APP_CONTROL_ERROR_NONE) {
		ERR("app_control_set_mime() failed.");
		app_control_destroy(app_control);
		return;
	}

	main_view *view = data;
	ret = app_control_send_launch_request(app_control, NULL, NULL);
	if (ret != APP_CONTROL_ERROR_NONE) {
		ERR("app_control_send_launch_request() failed.");

		if (ret == APP_CONTROL_ERROR_APP_NOT_FOUND) {
			_main_view_show_warning_popup(view->navi, _error, _app_not_found, _ok, view);
		} else {
			_main_view_show_warning_popup(view->navi, _error, _app_init_failed, _ok, view);
		}
	}

	app_control_destroy(app_control);
}

static void _main_view_timer_2_cb(void *data, Evas_Object *obj, const char *emission, const char *source)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;
	view->selected_timer_interval = 2;
}

static void _main_view_timer_5_cb(void *data, Evas_Object *obj, const char *emission, const char *source)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;
	view->selected_timer_interval = 5;
}

static void _main_view_timer_10_cb(void *data, Evas_Object *obj, const char *emission, const char *source)
{
	RETM_IF(!data, "data is NULL");
	main_view *view = data;
	view->selected_timer_interval = 10;
}

static void _main_view_show_warning_popup(Evas_Object *navi, const char *caption, const char *text, const char *button_text, void *data)
{
	RETM_IF(!data, "data is null");
	DBG(" <<< called");
	main_view *view = data;

	Evas_Object *popup = elm_popup_add(navi);
	RETM_IF(!popup, "popup is not created");
	elm_object_part_text_set(popup, "title,text", caption);
	elm_object_text_set(popup, text);
	evas_object_show(popup);

	Evas_Object *button = elm_button_add(popup);
	RETM_IF(!button, "button is not created");
	elm_object_style_set(button, POPUP_BUTTON_STYLE);
	elm_object_text_set(button, button_text);
	elm_object_part_content_set(popup, POPUP_BUTTON_PART, button);
	evas_object_smart_callback_add(button, "clicked", _main_view_popup_close_cb, view);

	eext_object_event_callback_add(popup, EEXT_CALLBACK_BACK, _main_view_popup_close_cb, view);

	view->popup = popup;
}

static void _main_view_popup_close_cb(void *data, Evas_Object *obj, void *event_info)
{
	RETM_IF(!data, "data is null");
	DBG(" <<< called");
	main_view *view = data;
	if (view->popup) {
		DBG("popup closed");
		evas_object_del(view->popup);
		view->popup = NULL;
	}
}
