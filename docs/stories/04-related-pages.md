# **Project Related Pages and Integrations**

This document covers user stories and acceptance criteria for external pages and views that are affected by or interact with the CRM Project/Job Site enhancement.

---

### **User Story: Dodge Project Integration**

**Description:**

As a Sales Rep,
I want to create CRM Projects directly from Dodge Project records and navigate seamlessly between them,
So that I can start CRM projects quickly without redundant data entry and maintain context across both platforms.

**Acceptance Criteria:**

Feature: 1. Dodge Project Integration

  Scenario Outline: 1.1. Create CRM Project from Dodge Project View
    Given I am viewing an unlinked Dodge Project on the "<view_type>"
    When I click the "Create CRM Project" button
    Then I should be navigated to the "Create New Project" modal form
    And the form should be pre-populated with data from the Dodge Project record
    And the "General Contractor" section should be visible and pre-populated if a GC was identified in the Dodge data

    Examples:
      | view_type                  |
      | Dodge Project List View    |
      | Dodge Project Detail View  |

  Scenario: 1.2. View Linked CRM Project
    Given a Dodge Project has already been linked to a CRM Project
    When I view the Dodge Project record
    Then I should see a "View CRM Project" link instead of the "Create CRM Project" button
    When I click the "View CRM Project" link
    Then I should be navigated to the "Project Detail" page for that linked CRM Project

  Scenario: 1.3. View Linked Dodge Project from CRM Project
    Given a CRM Project is linked to a Dodge Project
    When I am on the "Project Detail" page for that CRM Project
    And I click the "View Dodge Project" link
    Then I should be navigated to the external Dodge Project detail view

---

### **User Story: Customer Projects View**

**Description:**

As a Sales Rep,
I want to view a list of all jobsites/projects associated with a specific customer from their detail page,
So that I have a complete picture of every project the customer is involved in.

**Acceptance Criteria:**

Feature: 2. Customer Projects View

  Background:
    Given I am on the "Customer Detail" page

  Scenario: 2.1. Navigate to Customer Projects List
    When I click the "Projects" link in the left-side navigation panel
    Then I should see a table displaying all CRM Projects associated with this customer
    And the table headers should include "Project Name", "Status", "General Contractor", "Sales Rep(s)", "PAR", "PAR Start Date", and "PAR status indicator"
    And a count of the total visible projects should be displayed above the table

  Scenario: 2.2. Empty State for Customers with No Projects
    Given the customer has no associated CRM Projects
    When I click the "Projects" link in the left-side navigation panel
    Then I should see an empty-state message instead of the project table

  Scenario: 2.3. Filter Customer Projects by Status
    Given the Customer Projects list contains projects of various statuses
    When I select a status from the "Status" dropdown filter
    Then the table should immediately update to show only projects with the selected status
    When I select "All" from the dropdown filter
    Then the filter should be removed and all projects should be shown

---

### **User Story: CRM Opportunity to Project Link**

**Description:**

As a Sales Rep,
I want to link a CRM Project to an opportunity from the opportunity detail view,
So that the relationship between a deal and its specific jobsite is accurately recorded.

**Acceptance Criteria:**

Feature: 3. CRM Opportunity to Project Link

  Background:
    Given I am on the "Opportunity Detail" view

  Scenario: 3.1. CRM Project Lookup and Selection
    When I click on the "CRM Project" lookup field
    Then a searchable table of CRM Projects should appear
    When I type a project name into the search input
    And I click on the target project row from the filtered results
    Then the lookup table should close
    And the "CRM Project" field should display the selected project's name as a clickable link

  Scenario: 3.2. Change the Linked CRM Project
    Given the opportunity is already linked to a CRM Project
    When I click the "CRM Project" lookup field and select a different target project
    Then the previously linked project should be replaced with the new selection
    And the opportunity should now be exclusively linked to the new project

  Scenario: 3.3. Navigate to Linked CRM Project
    Given the opportunity is already linked to a CRM Project
    When I click the linked project name in the "CRM Project" field
    Then I should be navigated to the "Project Detail" page for that specific CRM Project

---

### **User Story: Global Top Navigation**

**Description:**

As an Executive or Sales Rep,
I want to navigate to the Project List from the "On The Go" menu in the CRM global top navigation bar,
So that I can easily switch context to manage my job sites and project pipelines from anywhere in the application.

**Acceptance Criteria:**

Feature: 4. Global Navigation

  Background:
    Given I am configured as either an "Executive" or "Sales Rep" in the CRM
    And the global top navigation bar is active

  Scenario: 4.1. Navigate to Projects Module via "On The Go" Menu
    When I click the "On The Go" dropdown menu in the global top navigation bar
    Then a menu should open displaying a "Leads and Opportunities" section
    And I should see a "Projects" link as the bottom item in the "Leads and Opportunities" section
    When I click the "Projects" link
    Then I should be navigated to the "Project List" page (`/`)
    And the link should be visually highlighted to indicate the active section
