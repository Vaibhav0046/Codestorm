package com.campus.eventmanagement.dto;

import lombok.Data;
import com.campus.eventmanagement.enums.FoodPreference;
import com.campus.eventmanagement.enums.TShirtSize;

@Data
public class ParticipantDto {
    private String name;
    private String email;
    private String phone;
    private TShirtSize tshirtSize;
    private FoodPreference foodPreference;
    private String college;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public TShirtSize getTshirtSize() {
		return tshirtSize;
	}
	public void setTshirtSize(TShirtSize tshirtSize) {
		this.tshirtSize = tshirtSize;
	}
	public FoodPreference getFoodPreference() {
		return foodPreference;
	}
	public void setFoodPreference(FoodPreference foodPreference) {
		this.foodPreference = foodPreference;
	}
	public String getCollege() {
		return college;
	}
	public void setCollege(String college) {
		this.college = college;
	}
}
