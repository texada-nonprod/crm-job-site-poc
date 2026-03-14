### **User Story: Edit Core Project Information**

**Description:**

As an Inside Sales Rep,
I want to edit the core details of a project (like Location, Status, Valuation, Owners, and Assignees),
So that the CRM record stays accurate as the project evolves over time.

**Acceptance Criteria:**

Feature: 1. Edit Project Information

  Background:
    Given I am on the "Project Detail" page

  Scenario: 1.1. Quick Status Change
    When I click the Status dropdown badge next to the project title
    And I select "Planning" from the list
    Then I should see the success toast message "Project status changed to 'Planning'."
    And the badge color and text should immediately update to reflect the "Planning" status

  Scenario: 1.2. Edit Project Using Modal
    When I click the "Edit" button in the "Project Information" section
    Then the "Edit Project Details" modal should open with the current project data pre-filled
    When I select an additional user from the "Assignee(s) *" combobox
    And I toggle the Location from "Address" to "Coordinates"
    And I type "37.77" into the "Latitude *" input
    And I type "-122.41" into the "Longitude *" input
    And I type "1000000" into the "Valuation ($)" input
    And I select "Planning" from the "Primary Stage" dropdown
    And I select a date on the "Target Start Date" calendar picker
    And I select "Turner Construction" from the "Project Owner Company *" combobox
    And I check the contact boxes for the Owner Contacts
    And I click the "Save Changes" button
    Then I should see the success toast message "Project updated successfully."
    And the modal should close
    And the "Project Information" section should display the updated details

### **User Story: Manage Project Notes**

**Description:**

As an Outside Sales Rep,
I want to add, edit, and filter free-text notes with specific tags,
So that I can log qualitative updates about a project site layout or security policies for the rest of the team.

**Acceptance Criteria:**

Feature: 2. Project Notes Management

  Background:
    Given I am on the "Project Detail" page
    And I scroll to the "Notes" section

  Scenario: 2.1. Filter Existing Notes
    When I type a keyword into the "Search notes..." input
    And I select a tag from the "Filter by tag" dropdown
    And I select an author from the "Filter by author" dropdown
    Then the Notes list should immediately filter to display only records matching all criteria

  Scenario: 2.2. Add a New Note
    When I click the "Add Note" button
    Then the "Create Note" modal should open
    When I type "Security requires hard hats." into the Note textarea
    And I select "Logistics" from the "Tags" multi-select
    And I click the "Save" button
    Then I should see the success toast message
    And the modal should close
    And the new note should appear at the top of the Notes list with the "Logistics" tag

  Scenario: 2.3. View Note History
    Given a note has been modified previously
    When I click "View history" on the note card
    Then the history block should expand to show the previous edits, timestamps, and authors

  Scenario: 2.4. Edit an Existing Note
    When I click the "Edit" button on a note row
    Then the "Edit Note" modal should open
    When I change the text to "Security requires full PPE (boots, hard hats, vests)."
    And I click "Save"
    Then I should see the success toast message
    And the note row should display the updated text and a modification timestamp

  Scenario: 2.5. Delete a Note
    When I click the "Delete" button on a note row
    Then I should see an Alert Dialog confirming the deletion
    When I click "Delete" in the dialog
    Then I should see the success toast message
    And the note should be removed from the list

### **User Story: Remove Entity Associations**

**Description:**

As an Inside Sales Rep,
I want to remove companies, equipment, and activities from a project if they are no longer relevant,
So that the project record isn't cluttered with outdated or incorrect information.

**Acceptance Criteria:**

Feature: 3. Remove Entities

  Background:
    Given I am on the "Project Detail" page

  Scenario Outline: 3.1. Remove Entity from Table
    When I locate a row in the "<section_name>" section table
    And I click the "Delete" 'X' icon button on that row
    Then an Alert Dialog titled "<dialog_title>" should open
    When I click the "<confirm_text>" button in the dialog
    Then I should see a success toast message
    And the row should be removed from the table

    Examples:
      | section_name       | dialog_title      | confirm_text |
      | Companies          | Remove Company?   | Remove       |
      | Activities         | Delete Activity?  | Delete       |
      | Customer Equipment | Remove Equipment? | Remove       |
