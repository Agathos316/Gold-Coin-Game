/* USER SETTINGS */
NumberPlayersToSimulate = [8,11];    // If single number, [n]: will simulate one game for 'n' players.
                                    // If a range of numbers, [n0,n1]: will simulate multiple games for 'n0' players to 'n1' players.
PrintWhen = 2;                      // When to print detailed game progress data (summary data will always be printed):
                                    // 0 = never, 1 = after every turn, 2 = only after every round, 3 = only at the end of the game.
                                    // Note: if multiple games will be simulated, the program forces 'PrintWhen' to 3.

/* PROGRAM START */
// Setup the master loop to simulate one or multiple games.
LoopStart = 0;
LoopEnd = 0;
// Min games check (minimum is 3 players).
if(NumberPlayersToSimulate[0] < 3) { NumberPlayersToSimulate[0] = 3; }
// If simulating one game only.
if(NumberPlayersToSimulate.length == 1) {
    LoopStart = NumberPlayersToSimulate[0];
    LoopEnd = LoopStart + 1;
// If simulating multiple games.
} else if(NumberPlayersToSimulate.length == 2) {
    LoopStart = NumberPlayersToSimulate[0];
    LoopEnd = NumberPlayersToSimulate[1] + 1;
    if(LoopEnd < LoopStart + 1) { LoopEnd = LoopStart + 1; }
    if(PrintWhen > 0) { PrintWhen = 3; }    // Force to print only after each game.
} else { LoopEnd = -1; }

// Loop through as many games as are needed.
for(j = LoopStart; j < LoopEnd; j++) {
    Players = [];                   // Each element of Players is itself an array: [c0,r1,r2,...], one array per player:
                                    // - Element c0 is the player's current number of coins.
                                    // - Elements r1,r2,... are the number of coins that the player is/was required to give
                                    //   in each round (1,2,...) as the game progresses. This is built in for analysis only.
                                    //   The game could be coded to run without this data being saved.
    NumPlayers = j;                 // Number of players in the game (from 3 to n).
    PlayerTurn = 0;                 // Index of the player number whose current turn it is (from 0 to n).
    Round = 0;                      // Current round number (code expects initialize to 0, but first round will be 1).
    Give = 1;                       // The number of coins the current player must give (either 1 or 2, alternating, start with 1).
    NumPlayersAfterFirstRound = 0;  // The number of players remaining in the game after the first round.
    WinnerFound = false;            // Flag for if a winner is found.

    // Print the starting condition of the game (num players, 1 coin per player).
    console.log('-'.padEnd(50,'-'));
    console.log(`Simulating game with ${j} players.`);
    switch(PrintWhen) {
        case 0:
            console.log("Printing minimal results after each game.\n");
            break;
        case 1:
            console.log("Printing results every player's turn.\n");
            break;
        case 2:
            console.log("Printing results after every round.\n");
            break;
        case 3:
            console.log("Printing results at the end of the game.\n");
            break;
    }
    for(let i = 0; i < NumPlayers; i++) {
        Players.push([1]);
    }
    if(PrintWhen > 0) { PrintGameStatus(Players); }

    // Run the game.
    Round++;
    while (1) {
        Players[PlayerTurn][0] -= Give;                     // Remove 1 or 2 coins from the current player.
        Players[PlayerTurn].push(Give);                     // Store how many coins this player needed to give in this round.
        let NextPlayerTurn = FindNextPlayer(PlayerTurn);    // Determine the index of the next eligile player (next player with >0 coins).
        Players[NextPlayerTurn][0] += Give;                 // Add 1 or 2 coins to the next player.
        if(Give == 1) {Give = 2;} else {Give = 1;}          // Alternate the number of coins required to give, ready for the next player.

        if(PrintWhen == 1) { PrintGameStatus(Players); }

        // If the next eligible player now has all the coins, then the game has collapsed to a winner. Exit the loop.
        if(Players[NextPlayerTurn][0] == NumPlayers) {
            WinnerFound = true;
            break;
        }

        // If the next player is earlier in the list of players, then we have just finished a round.
        if(NextPlayerTurn < PlayerTurn) {
            if(PrintWhen == 2) { PrintGameStatus(Players); }

            // If we've just finished the first round, then find and store the number of players still eligible to play.
            // This is an important piece of information.
            if(Round == 1) {
                for(i = 0; i < NumPlayers; i++) {
                    if(Players[i][0] > 0) { NumPlayersAfterFirstRound++; }
                }
            }

            // If we've played at least 3 rounds, then check for infinite iterations, in which case exit the loop and abort the game.
            if(Round > 2) {
                // Compare the 'give coins' data of two rounds ago, and one round ago, with the round just completed.
                // If there is a certain pattern, then we are in an infinite cycle.
                let InfiniteCycle = true;           // Assume we're in an infinite cycle. Falsify this if the pattern does not hold true.
                for(i = 0; i < NumPlayers; i++) {
                    if(Players[i][Round] != undefined) {
                        if((Players[i][Round] != Players[i][Round - 2]) || (Players[i][Round] == Players[i][Round - 1])) {
                            InfiniteCycle = false;
                            break;
                        }
                    }
                }
                if(InfiniteCycle) {
                    console.log('Infinite loop detected.\nGame aborted.');
                    break;      // Exit the 'while' loop.
                }
            }
            // Increment to the next round.
            Round++;
        }

        // Progress to the next eligible player's turn.
        PlayerTurn = NextPlayerTurn;
    }
    if(PrintWhen >= 2) { PrintGameStatus(Players); }
    // Print output data based on whether a winner was found or not.
    if(WinnerFound) {
        console.log('Completed with ' + NumPlayers + ' players.');
        if(NumPlayersAfterFirstRound > 1) {
            console.log('After first round: ' + NumPlayersAfterFirstRound + ' players.');
        } else {
            console.log('After first round: ' + NumPlayersAfterFirstRound + ' player.');
        }
        //console.log('Sequence for winning player: ' + Players[PlayerTurn].toString());
        console.log('Required ' + Round + ' rounds to complete.')
        console.log('');
    }
    /*else {
        console.log('!! FAILED TO COLLAPSE with ' + NumPlayers + ' players.');
        console.log('After first round: ' + NumPlayersAfterFirstRound + ' players.');
        console.log('');
    }*/

    // Find the next eligible player (next player with >0 coins).
    function FindNextPlayer(CurrentPlayer) {
        // Extract the coins per player.
        let Coins = [];
        for(i = 0; i < NumPlayers; i++) {
            Coins.push(Players[i][0]);
        }
        // Initialize the next player to be one beyond the current player.
        let NextPlayer = CurrentPlayer + 1;
        // Check whether we need to loop back to the start of the Players array.
        if(NextPlayer == NumPlayers) {NextPlayer = 0;}
        // Check whether the next player has >0 coins, and increment the next player until this condition is met.
        while(Coins[NextPlayer] == 0) {
            NextPlayer++;
            if(NextPlayer == NumPlayers) {NextPlayer = 0;}
        }
        return NextPlayer;
    }

    // Print current game data to console.
    function PrintGameStatus(arr) {
        if(Round == 0) {
            console.log('Coins held by each player');
        }
        for(col = 0; col < Round + 1; col++) {
            let str = "";
            if(arr[0][col] == undefined) {
                str = " ";
            } else {
                str = arr[0][col];
            }
            for(row = 1; row < arr.length; row++) {
                if(arr[row][col] == undefined) {
                    str = str + "   ";
                } else {
                    if(arr[row][col] > 9) {
                        str = str + "," + arr[row][col];
                    } else {
                        str = str + ", " + arr[row][col];
                    }
                }
            }
            if(col == 0) {
                if(PrintWhen == 1) {
                    console.log(`Round ${Round}.${PlayerTurn}: `.padEnd(14) + str);
                } else {
                    console.log(`Round ${Round}: `.padEnd(14) + str);
                }
                if(Round > 0) { console.log('_'.padEnd(14 + NumPlayers * 3 + 4,'_')); }
            } else {
                if(col == 1) {
                    console.log('| Give coins:'.padEnd(14) + str.replaceAll(',',' ') + '     |');
                } else {
                    console.log('|'.padEnd(14) + str.replaceAll(',',' ') + '     |');
                }
            }
        }
        if(Round == 0) {
            console.log('\n');
        } else {
            console.log('-'.padEnd(14 + NumPlayers * 3 + 4,'-') + '\n\n');
        }
    }
}