### **User Story: Associate Existing Leads & Opportunities**

**Description:**

As an Inside Sales Rep,
I want to link a lead/opportunity that was already created in the ERP to this CRM project,
So that all quoting activity tied to this jobsite is centralized.

**Acceptance Criteria:**

Feature: 1. Associate Project Opportunity

  Background:
    Given I am on the "Project Detail" page
    And I click the "Associate Existing" button in the "Leads & Opportunities" section

  Scenario: 1.1. Open Associate Opportunity Modal
    Then the "Associate Opportunity" modal should open
    And I should see a table of available opportunities not yet associated to this project

  Scenario: 1.2. Successfully Associate Opportunity
    When I click the radio button in the table row for an existing opportunity
    And I click the "Associate" button
    Then I should see the success toast message
    And the modal should close
    And the opportunity should appear in the "Leads & Opportunities" table

  Scenario: 1.3. Prevent Empty Association
    When no opportunity is selected
    Then the "Associate" button should be disabled

### **User Story: Associate Existing Companies**

**Description:**

As an Outside Sales Rep,
I want to add a company that is already in our CRM database as a subcontractor on this project,
So that I can build out the roster of companies working on site.

**Acceptance Criteria:**

Feature: 2. Associate Project Company

  Background:
    Given I am on the "Project Detail" page
    And I click the "Associate Existing" button in the "Companies" section
    Then the "Associate Existing Company" modal should open

  Scenario: 2.1. Successfully Link Existing Company
    When I click the "Company *" combobox
    And I type "Turner Construction" into the search
    And I select "Turner Construction" from the list
    And I select "General Contractor" from the "Role(s) *" multi-select
    And I check the "Turner Primary Contact" checkbox in the Optional Contacts list
    And I click the "Star" icon next to it to mark it as the primary contact
    And I click the "Associate Company" button
    Then I should see the success toast message
    And the modal should close
    And "Turner Construction" should appear in the "Companies" table with the "General Contractor" badge

  Scenario Outline: 2.2. Validation Errors on Association
    When I select "<company_name>" from the Company combobox
    And I click the "Associate Company" button with no roles selected
    Then I should see the error message "Please select a company and at least one role."
    And the modal should remain open

    Examples:
      | company_name |
      |              |
      | Acme Corp    |

### **User Story: Associate Existing Customer Equipment**

**Description:**

As a Product Support Rep,
I want to link an existing piece of machinery tracked in our ERP to this specific project,
So that I know precisely where that asset is currently deployed.

**Acceptance Criteria:**

Feature: 3. Associate Customer Equipment

  Background:
    Given I am on the "Project Detail" page
    And I click the "Associate Existing" button in the "Customer Equipment" section
    Then the "Associate Existing Equipment" modal should open

  Scenario: 3.1. Successfully Link Equipment
    When I select "Smith Electrical Inc." from the "Company *" combobox
    Then a table of available equipment for that company should appear
    When I click the table row for "CAT 320"
    And I click the "Associate" button
    Then I should see the success toast message
    And the modal should close
    And the "CAT 320" should appear under its owning company in the Equipment table

  Scenario: 3.2. Empty Equipment Selection Error
    When no equipment is selected in the table
    Then the "Associate" button should be disabled

  Scenario: 3.3. Equipment Conflict Dialog
    Given the equipment is already assigned to "Another Project"
    When I click the "Associate" button
    Then an Alert Dialog titled "Equipment Already Assigned" should open
    And I should see a warning that it is assigned to "Another Project"
    When I click "Continue"
    Then the equipment should be associated with my project
