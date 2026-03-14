### **User Story: Create New Leading & Opportunity**

**Description:**

As an Inside Sales Rep,
I want to create a new opportunity directly linked to this project,
So that I don't have to navigate to a separate screen and manually re-link the project record.

**Acceptance Criteria:**

Feature: 1. Create Project Opportunity

  Background:
    Given I am on the "Project Detail" page
    And I click the "Create New" button in the "Leads & Opportunities" section

  Scenario: 1.1. Open Create Opportunity Modal
    Then the "Create New Opportunity" modal should open

  Scenario: 1.2. Successfully Create Opportunity
    When I type "New Backup Generator Install" into the "Description" input (#description)
    And I type "50000" into the "Estimated Revenue" input (#revenue)
    And I select "Power" from the "Division" dropdown
    And I select "Estimation" from the "Stage" dropdown
    And I click the "Create" button
    Then I should see the success toast message
    And the "Create New Opportunity" modal should close
    And the new opportunity should appear in the "Leads & Opportunities" table

  Scenario Outline: 1.3. Validation Errors on Required Fields
    When I clear the "Description" input (#description)
    And I select "<division_id>" from the "Division" dropdown
    And I click the "Create" button
    Then I should see the error message "Please fill in all fields"

    Examples:
      | division_id |
      | (leave blank) |
      | Power       |

### **User Story: Create New Prospect Company**

**Description:**

As an Outside Sales Rep,
I want to quickly create a new prospect company right from the project screen,
So that I can capture a new sub-contractor I just met on-site without losing context.

**Acceptance Criteria:**

Feature: 2. Create Prospect Company

  Background:
    Given I am on the "Project Detail" page
    And I click the "Create New" button in the "Companies" section
    Then the "Create New Prospect" modal should open

  Scenario: 2.1. Successfully Create Prospect
    When I type "Smith Electrical Inc." into the "Company Name *" input
    And I select "Power" from the "Division(s) *" multi-select
    And I select "Electrical Subcontractor" from the "Role(s) *" multi-select
    And I type "555-0100" into the "Phone Number *" input
    And I type "123 Main St" into the "Address Line 1" input
    And I select "United States" from the "Country *" combobox
    And I select "California" from the "State *" combobox
    And I type "Los Angeles" into the "City *" input
    And I type "90001" into the "ZIP/Postal code *" input
    And I type "John" into the "First Name *" input
    And I type "Smith" into the "Last Name *" input
    And I type "Owner" into the "Title *" input
    And I type "555-0200" into the "Mobile Phone *" input
    And I type "john@example.com" into the "Email *" input
    And I click the "Create Prospect" button
    Then I should see the success toast message
    And the modal should close
    And "Smith Electrical Inc." should appear in the "Companies" table with the "Electrical Subcontractor" badge

  Scenario: 2.2. Validation Errors on Required Fields
    When I leave the required fields empty
    And I click the "Create Prospect" button
    Then I should see the "Validation Error" toast message "Please fix the highlighted fields."
    And I should see inline error messages below the missing required fields such as "Required", "Select at least one division", and "Select at least one role"

### **User Story: Create New Activity**

**Description:**

As an Outside Sales Rep,
I want to log a new activity (call, email, visit) directly to the project,
So that my managers have visibility into my account engagement.

**Acceptance Criteria:**

Feature: 3. Create Project Activity

  Background:
    Given I am on the "Project Detail" page
    And I click the "Create New" button in the "Activities" section
    Then the "Create New Activity" modal should open

  Scenario: 3.1. Successfully Create Activity
    When I select "John Doe" from the "Sales Rep" dropdown
    And I select "Face-to-Face" from the "Activity Type" dropdown
    And I select the current date on the "Date & Time" picker
    And I select "Smith Electrical Inc." from the "Company (optional)" combobox
    And I select "John Smith" from the "Contact" combobox
    And I type "Met on site to discuss generator pad." into the "Description" input (#description)
    And I type "He seemed very interested." into the "Notes" textarea (#notes)
    And I click the "Create" button
    Then I should see the success toast message
    And the modal should close
    And the new Face-to-Face activity should appear in the "Activities" table (marked Completed if the date is in the past, or Outstanding if in the future)

  Scenario: 3.2. Expand More Fields
    When I click the "More fields" collapsible button
    Then I should see the "Campaign", "Issue", and "Follow-up to" dropdowns become available for selection

  Scenario: 3.3. Follow-Up on Existing Activity
    Given I have a completed activity in the "Activities" table
    When I click the "Follow up" icon button in the table row
    Then the "Create New Activity" modal should open
    And the system should internally link this new activity to the one I clicked
    And I should see a note indicating it is a follow-up near the top of the modal

### **User Story: Add Brand New Customer Equipment**

**Description:**

As a Product Support Rep,
I want to create brand new equipment records on the fly,
So that I can log competitive machines found at a jobsite into our global Master Equipment list while simultaneously linking them to this project.

**Acceptance Criteria:**

Feature: 4. Create Customer Equipment

  Background:
    Given I am on the "Project Detail" page
    And I click the "Create New" button in the "Customer Equipment" section
    Then the "Create New Equipment" modal should open

  Scenario: 4.1. Successfully Create Equipment
    When I select "Smith Electrical Inc." from the "Company *" combobox
    And I select "Caterpillar" from the "Make *" combobox
    And I select "EXCAVATORS, SHOVELS AND DRAGLINE" from the "Family Product Code *" combobox
    And I select "420" from the "Compatibility Code *" combobox
    And I type "320F" into the "Model *" input
    And I type "CAT12345" into the "Serial Number *" input
    And I type "2019" into the "Year of Manufacture *" input
    And I click "In Territory" on the "Territory *" toggle group
    And I click the "Create Equipment" button
    Then I should see the success toast message
    And the modal should close
    And the new equipment should appear in the equipment table group for "Smith Electrical Inc."

  Scenario: 4.2. Expand Additional Fields
    When I click the "Additional Fields" collapsible button
    Then I should see optional fields become available, including "Equipment Number", "SMU", "SMU Date", "Industry Group", "Engine Make", and "Purchase Date"
