"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";
import {useDebounceValue} from "usehooks-ts"


export const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState("");
    const debouncedValue = useDebounceValue(value, 100);
    const debouncedSearch = debouncedValue[0];

    const pathname = usePathname();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const handleSubmit = () => {

        const url = qs.stringifyUrl({
            url: pathname,
            query: {    
                search: value,
            }
        }, {
            skipEmptyString: true,
            skipNull: true,
        })

        router.push(url);
    }

    
    useEffect(() => {
        const url = qs.stringifyUrl({
            url: pathname,
            query: { 
            search: debouncedSearch,
            },
        }, {skipEmptyString: true, skipNull: true});

        router.push(url);
    }, [debouncedSearch, pathname]);


    return (
        <div className="w-full relative flex">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
            <Input
                className="w-full pl-9"
                placeholder="Search..."
                onChange={handleChange}
                value={value}
            />
            {/* <Button className="ml-2 hidden md:block" variant={"ghost"} onClick={handleSubmit}>
                Search
            </Button>
             */}
        </div>
    )
}   
