#include "Camera.hpp"

namespace gps {

	//Camera constructor
	Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
		//TODO
		this->cameraPosition = cameraPosition;
		this->cameraTarget = cameraTarget;
		this->cameraUpDirection = cameraUp;
		this->cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
		this->cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUp));
	}

	float yaw = -90.0f;

	//return the view matrix, using the glm::lookAt() function
	glm::mat4 Camera::getViewMatrix() {
		//TODO
		//cameraTarget = cameraPosition + cameraFrontDirection;
		return glm::lookAt(cameraPosition, cameraPosition + cameraFrontDirection, cameraUpDirection);
	}

	glm::vec3 Camera::getCameraTarget()
	{
		return cameraTarget;
	}

	//update the camera internal parameters following a camera move event
	void Camera::move(MOVE_DIRECTION direction, float speed) {
		//TODO
		if (direction == gps::MOVE_FORWARD) {
			cameraPosition += cameraFrontDirection * speed;
		}

		if (direction == gps::MOVE_BACKWARD) {
			cameraPosition -= cameraFrontDirection * speed;
		}

		if (direction == gps::MOVE_LEFT) {
			cameraPosition -= cameraRightDirection * speed;
		}

		if (direction == gps::MOVE_RIGHT) {
			cameraPosition += cameraRightDirection * speed;
			cameraTarget = cameraPosition + cameraFrontDirection;
		}
	}

	//update the camera internal parameters following a camera rotate event
	//yaw - camera rotation around the y axis
	//pitch - camera rotation around the x axis
	void Camera::rotate(float pitch, float yaw) {
		//TODO
		glm::vec3 front;
		front.x = cos(glm::radians(pitch)) * cos(glm::radians(yaw));
		front.y = sin(glm::radians(pitch));
		front.z = cos(glm::radians(pitch)) * sin(glm::radians(yaw));
		cameraFrontDirection = glm::normalize(front);
		cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, glm::vec3(0.0f, 1.0f, 0.0f)));
		cameraUpDirection = glm::normalize(glm::cross(cameraRightDirection, cameraFrontDirection));
	}

}