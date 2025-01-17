-- MySQL Script generated by MySQL Workbench
--  4 Aprili 2024 11:50:41 alasiri
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema crowdfunding
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema crowdfunding
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `crowdfunding` DEFAULT CHARACTER SET utf8 ;
USE `crowdfunding` ;

-- -----------------------------------------------------
-- Table `crowdfunding`.`campaignCategory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crowdfunding`.`campaignCategory` (
  `category_id` INT AUTO_INCREMENT NOT NULL,
  `category_name` VARCHAR(45) NULL,
  PRIMARY KEY (`category_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `crowdfunding`.`images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crowdfunding`.`images` (
  `image_id` INT AUTO_INCREMENT NOT NULL,
  `image_url` VARCHAR(500) NULL,
  PRIMARY KEY (`image_id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `crowdfunding`.`campaigns`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crowdfunding`.`campaigns` (
  `campaign_id` INT AUTO_INCREMENT NOT NULL,
  `campaign_title` VARCHAR(45) NULL,
  `campaign_description` TEXT(2000) NULL,
  `target_amount` INT NOT NULL,
  `funding_deadline` DATE NOT NULL, -- Use DATE datatype for date fields,
  `industry` VARCHAR(45) NULL,
  `is_active` VARCHAR(45) NULL,
  `current_amount` INT(45) NULL,
  `creator_id` INT NOT NULL,
  PRIMARY KEY (`campaign_id`),
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`user_id`)
  )
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `crowdfunding`.`campaign_images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crowdfunding`.`campaignImages` (
`campaign_images_id` INT AUTO_INCREMENT NOT NULL,
`campaign_id` INT NOT NULL,
`image_id` INT NOT NULL,
 
FOREIGN KEY (`campaign_id`) REFERENCES `crowdfunding`.`campaigns`(`campaign_id`),
FOREIGN KEY (`image_id`) REFERENCES `crowdfunding`.`images`(`image_id`),
PRIMARY KEY (`campaign_images_id`)
)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `crowdfunding`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crowdfunding`.`users` (
  `user_id` INT AUTO_INCREMENT NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `location` VARCHAR(100) NULL,
  `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `account_type` ENUM('investor', 'entrepreneur', 'admin') NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
)

ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `crowdfunding`.`transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `crowdfunding`.`transactions` (
  `transaction_id` INT AUTO_INCREMENT NOT NULL,
  `payment_method` VARCHAR(45) NULL,
  `transaction_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `transaction_status` VARCHAR(45) NULL,
  `transaction_amount` DECIMAL(10, 2) NOT NULL,
  `sender_id` INT NOT NULL,
  `campaign_id` INT NOT NULL,
  PRIMARY KEY (`transaction_id`),
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`),
  FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`campaign_id`)
)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
