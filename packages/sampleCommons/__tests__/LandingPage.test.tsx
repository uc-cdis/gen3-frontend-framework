import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Colors from '../src/pages/Colors';

describe('Home', () => {
  it('should have Docs text', () => {
    render(
      <Colors
        headerProps={{ navigation: {}, top: { items: [] } }}
        footerProps={{}}
      />,
    ); // Arrange

    const element = screen.getByText('Docs'); // Act

    expect(element).toBeInTheDocument(); // Assert
  });

  it('should have given sentence', () => {
    render(
      <Colors
        headerProps={{ navigation: {}, top: { items: [] } }}
        footerProps={{}}
      />,
    ); // Arrange

    const element = screen.getByText(/find in-depth/i); // Act

    expect(element).toBeInTheDocument(); // Assert
  });
});
