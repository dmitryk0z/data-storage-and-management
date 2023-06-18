import React, { useState, useEffect } from 'react';

import { listCustomers } from './graphql/queries';
import { createCustomers, deleteCustomers, updateCustomers } from './graphql/mutations';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

function App() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    first_name: '',
    last_name: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const apiResponse = await API.graphql(graphqlOperation(listCustomers));
      const fetchedCustomers = apiResponse.data.listCustomers.items;
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.log('Error fetching customers:', error);
    }
  };

  const createCustomer = async () => {
    try {
      await API.graphql(graphqlOperation(createCustomers, {input: newCustomer}));
      setNewCustomer({ first_name: '', last_name: '' });
      fetchCustomers();
    } catch (error) {
      console.log('Error creating customer:', error);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await API.graphql(graphqlOperation(deleteCustomers, { input: { id: id }}));
      fetchCustomers();
    } catch (error) {
      console.log('Error deleting customer:', error);
    }
  };

  const updateCustomer = async (id, updatedData) => {
    try {
      const { createdAt, updatedAt, __typename, ...customerData } = updatedData;
      await API.graphql(graphqlOperation(updateCustomers, { input: { id: id, ...customerData }}));
      fetchCustomers();
    } catch (error) {
      console.log('Error updating customer:', error);
    }
  };
  
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const updateSelectedCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      await updateCustomer(selectedCustomer.id, selectedCustomer);
      setSelectedCustomer(null);
    } catch (error) {
      console.log('Error updating customer:', error);
    }
  };

  return (
    <div>
      <h1>Customer List</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        createCustomer();
      }}>
        <input
          type="text"
          name="first_name"
          value={newCustomer.first_name}
          placeholder="First Name"
          onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
        />
        <input
          type="text"
          name="last_name"
          value={newCustomer.last_name}
          placeholder="Last Name"
          onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
        />
        <button type="submit">Add Customer</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <React.Fragment key={customer.id}>
              <tr>
                <td>{customer.first_name}</td>
                <td>{customer.last_name}</td>
                <td>
                  <button onClick={() => deleteCustomer(customer.id)}>
                    Delete
                  </button>
                  <button onClick={() => selectCustomer(customer)}>
                    Edit
                  </button>
                </td>
              </tr>
              {selectedCustomer && selectedCustomer.id === customer.id && (
                <tr>
                  <td>
                    <input
                      type="text"
                      name="first_name"
                      value={selectedCustomer.first_name}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="last_name"
                      value={selectedCustomer.last_name}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <button onClick={updateSelectedCustomer}>Update</button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
