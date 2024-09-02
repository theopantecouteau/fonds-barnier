import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FondsBarnierApp = () => {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState(null);

    const checkEligibility = async () => {
        var requestOptions = {
            method: 'GET',
        };

        fetch("https://api.geoapify.com/v1/geocode/search?text=38%20Upper%20Montagu%20Street%2C%20Westminster%20W1H%201LJ%2C%20United%20Kingdom&apiKey=1715df14380244a0b69b5d884bb45d3c", requestOptions)
            .then(response => response.json())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <h2 className="text-2xl font-bold">Éligibilité au Fonds Barnier</h2>
            </CardHeader>
            <CardContent>
                <Input
                    type="text"
                    placeholder="Entrez votre adresse"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mb-4"
                />
                <Button onClick={checkEligibility}>Vérifier l'éligibilité</Button>
            </CardContent>
            {result && (
                <CardFooter>
                    <Alert>
                        <AlertDescription>
                            {result === 'eligible' && "Vous êtes éligible au Fonds Barnier !"}
                            {result === 'potentially' && "Vous êtes potentiellement éligible. Un diagnostic de vulnérabilité est nécessaire."}
                            {result === 'not-eligible' && "Vous n'êtes pas éligible au Fonds Barnier."}
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            )}
        </Card>
    );
};

export default FondsBarnierApp;